from fastapi import FastAPI

app = FastAPI()

@app.get("/api/python")
def hello_world(prompt: str = "Stone is"):
    return {"message": prompt}