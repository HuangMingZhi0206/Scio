import google.generativeai as genai
import warnings
warnings.filterwarnings("ignore")

genai.configure(api_key='AIzaSyBGTc2TR7VYB72oClrb2dzy6PY7nf7txRo')

models = []
for m in genai.list_models():
    if 'generateContent' in m.supported_generation_methods:
        models.append(m.name)

# Write to file
with open("available_models.txt", "w") as f:
    for name in models:
        f.write(name + "\n")

print(f"Found {len(models)} models. Saved to available_models.txt")
print("First 5:", models[:5])
