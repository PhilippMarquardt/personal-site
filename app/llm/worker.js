"use client"

import { pipeline, env } from "@xenova/transformers";

env.allowLocalModels = true;
env.userBrowserCache = false;
class PipelineSingleton {
    static task = 'text-generation';
    static model = "./";
    static instance = null;

    static async getInstance(progress_callback = null) {
        if (this.instance === null) {
            this.instance = pipeline(this.task, this.model, { progress_callback });
        }
        return this.instance;
    }
}

self.addEventListener('message', async (event) => {
    let generator = await PipelineSingleton.getInstance(x => {
        self.postMessage(x);
    });

    let output = await generator(event.data.text, {
        max_new_tokens: 50,
        temperature: 0.7,
    });

    self.postMessage({
        status: 'complete',
        output: output,
    });
});