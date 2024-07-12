from fastapi import FastAPI
import os
import torch
from transformers import GPT2LMHeadModel, GPT2TokenizerFast, GPT2Config
app = FastAPI()




def load_model(model_path, device, config_path):
    # Initialize tokenizer
    tokenizer = GPT2TokenizerFast.from_pretrained(config_path)
    tokenizer.pad_token = tokenizer.eos_token

    # Initialize a smaller GPT-2 config (make sure this matches your training config)
    config = GPT2Config(
        vocab_size=tokenizer.vocab_size,
        n_positions=512,
        n_ctx=512,
        n_embd=384,
        n_layer=6,
        n_head=6,
        pad_token_id=tokenizer.eos_token_id
    )

    # Load the model
    model = GPT2LMHeadModel(config)
    model.resize_token_embeddings(len(tokenizer))
    model.load_state_dict(torch.load(model_path, map_location=device))
    model = model.to(device)
    model.eval()

    return model, tokenizer

def generate_text(model, tokenizer, prompt, max_length=100, device='cuda'):
    input_ids = tokenizer.encode(prompt, return_tensors='pt').to(device)
    attention_mask = torch.ones_like(input_ids).to(device)
    
    with torch.no_grad():
        output = model.generate(
            input_ids, 
            attention_mask=attention_mask,
            max_length=max_length, 
            num_return_sequences=1, 
            do_sample=True, 
            top_k=50, 
            top_p=0.95,
            temperature=0.7,
            pad_token_id=tokenizer.eos_token_id
        )
    
    return tokenizer.decode(output[0], skip_special_tokens=True)


@app.get("/api/python")
def generate_text_api(prompt: str = "Stone is"):
    file_path = os.path.join(os.path.dirname(os.path.dirname(__file__)), "public")
    device = "cpu"
    model_path = os.path.join(file_path, "best_model.pth")

    model, tokenizer = load_model(model_path, device, file_path)

    generated_text = generate_text(model, tokenizer, prompt, max_length=200, device=device)
    return {"message": generated_text}