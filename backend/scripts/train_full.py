import os
import torch
import pandas as pd
from datasets import Dataset
from transformers import (
    AutoModelForCausalLM,
    AutoTokenizer,
    BitsAndBytesConfig,
    TrainingArguments,
)
from peft import LoraConfig, get_peft_model, prepare_model_for_kbit_training
from trl import SFTTrainer

# --- Configuration ---
# Use a pre-quantized 4-bit model directly for maximum memory efficiency
# "unsloth/llama-3-8b-bnb-4bit" is highly recommended for Colab T4
MODEL_NAME = "unsloth/llama-3-8b-bnb-4bit" 
NEW_MODEL_NAME = "scio-llama3-error-codes"

# File paths
DATASET_PATH = "../Dataset/large_error_codes.csv" 
# Fallback for Colab execution where file might be in root
if not os.path.exists(DATASET_PATH): 
    DATASET_PATH = "large_error_codes.csv"

def train():
    print(f"Loading dataset from {DATASET_PATH}...")
    try:
        df = pd.read_csv(DATASET_PATH)
    except FileNotFoundError:
        print("Error: Dataset file not found. Please upload 'large_error_codes.csv'.")
        return

    # Clean whitespace from column names
    df.columns = [c.strip() for c in df.columns]
    
    # Create the prompt format similar to the notebook
    def format_instruction(row):
        return f"""### User: What does error code {row['Code']} mean?

### Assistant: Error {row['Code']} corresponds to: {row['Description']}. It is classified under {row['Category']}."""

    df['text'] = df.apply(format_instruction, axis=1)
    dataset = Dataset.from_pandas(df[['text']])
    
    print("Dataset loaded. Sample:", dataset[0])

    # --- Model Loading (Memory Optimized) ---
    print("Loading model...")
    bnb_config = BitsAndBytesConfig(
        load_in_4bit=True,
        bnb_4bit_quant_type="nf4",
        bnb_4bit_compute_dtype=torch.float16,
        bnb_4bit_use_double_quant=True, # Saves a bit more memory
    )

    model = AutoModelForCausalLM.from_pretrained(
        MODEL_NAME,
        quantization_config=bnb_config,
        device_map="auto",
        trust_remote_code=True
    )
    
    # Enable gradient checkpointing to save VRAM (trades speed for memory)
    model.gradient_checkpointing_enable()
    model = prepare_model_for_kbit_training(model)

    tokenizer = AutoTokenizer.from_pretrained(MODEL_NAME, trust_remote_code=True)
    tokenizer.pad_token = tokenizer.eos_token
    tokenizer.padding_side = "right" # Fix for float16 mixed precision

    # --- LoRA Config ---
    peft_config = LoraConfig(
        lora_alpha=16,
        lora_dropout=0.1,
        r=16, # Reduced form 64 to 16 for better memory stability on generic hardware
        bias="none",
        task_type="CAUSAL_LM",
        target_modules=["q_proj", "k_proj", "v_proj", "o_proj", "gate_proj", "up_proj", "down_proj"]
    )

    model = get_peft_model(model, peft_config)
    model.print_trainable_parameters()

    # --- Training Arguments (Optimized for T4 GPU) ---
    training_args = TrainingArguments(
        output_dir="./scio_results",
        num_train_epochs=1,
        per_device_train_batch_size=2, # Keep low (1 or 2)
        gradient_accumulation_steps=4, # Increase to simulate larger batch
        optim="paged_adamw_32bit", # Paged optimizer is crucial for Colab memory
        save_steps=25,
        logging_steps=10,
        learning_rate=2e-4,
        weight_decay=0.001,
        fp16=True, # Use fp16 mixed precision
        bf16=False, # T4 does not support bf16
        max_grad_norm=0.3,
        warmup_ratio=0.03,
        group_by_length=True,
        lr_scheduler_type="constant",
    )

    # --- Trainer ---
    print("Starting training...")
    trainer = SFTTrainer(
        model=model,
        train_dataset=dataset,
        peft_config=peft_config,
        dataset_text_field="text",
        max_seq_length=512, # Shorter context (error codes are short)
        tokenizer=tokenizer,
        args=training_args,
        packing=False,
    )

    trainer.train()
    
    # Save processed model
    trainer.model.save_pretrained("scio-finetuned-adapter")
    print("Training finished! Adapter saved to ./scio-finetuned-adapter")

if __name__ == "__main__":
    train()
