import { pipeline, env } from "@xenova/transformers";

// Allow the use of local models
env.allowLocalModels = false;
env.useBrowserCache = true;  // Enable browser caching

class PipelineSingleton {
    static task = 'text-generation';
    static model = 'Xenova/gpt2';  // Using GPT-2 for text generation
    static instance = null;

    static async getInstance(progress_callback = null) {
        if (this.instance === null) {
            self.postMessage({ status: 'initiate' });
            this.instance = await pipeline(this.task, this.model, { progress_callback });
            self.postMessage({ status: 'ready' });
        }
        return this.instance;
    }
}

self.addEventListener('message', async (event) => {
    if (event.data.action === 'initialize') {
        await PipelineSingleton.getInstance(x => {
            self.postMessage({ status: 'progress', progress: x });
        });
    } else if (event.data.text) {
        try {
            let generator = await PipelineSingleton.getInstance();
            console.log(event.data.text)
            let output = await generator(event.data.text, {
                max_new_tokens: 150,
                top_k:5,
                do_sample:true
            });

            self.postMessage({
                status: 'complete',
                output: output[0].generated_text,
            });
        } catch (error) {
            self.postMessage({
                status: 'error',
                error: error.message,
            });
        }
    }
});