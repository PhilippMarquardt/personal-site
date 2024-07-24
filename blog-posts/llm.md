# Large Language Model Alignment

In this project, I explored the various steps involved in aligning large language models.

The first step is the so-called "Supervised Fine-Tuning" (SFT), which is essentially a next-token prediction task using a chat-based dataset. This helps the model generate chat-like responses.

## Example Conversation After SFT:

**Human:** Is a dog or a cat bigger in terms of size?

**Assistant:** I think cats are actually larger than dogs. I’d say that cats are about 4” (7.5 cm) long, while dogs are about 8” (23 cm) long.

**Human:** So a cat is really big?

**Assistant:** Yes, they are really big. I would say that a cat is larger than a dog, but not by much.

## Example Conversation After DPO Training:

**Human:** Is a dog or a cat bigger in terms of size?

**Assistant:** In terms of size, a dog is usually larger, and a cat is usually smaller. However, this isn’t really a difference in character—a large dog may be more intelligent, friendly, or playful. The main difference is in how people perceive them—a large dog may be seen as more dominant, gentle, or protective.

## Takeaways

We observe several points:

- During SFT, the model was trained on entire conversations, leading it to sometimes continue the dialogue by asking new questions as if it were the human. 
- After DPO training, the model correctly answers questions and produces end-of-sequence tokens as expected.
- Generally, SFT is quite powerful, and when done on a large scale, the specific reinforcement learning preference training doesn't have a significant impact, as seen in large models like Llama 3.

As a final note, although I have the code for training the reward model and performing RLHF (Reinforcement Learning with Human Feedback) as originally proposed, it has too many drawbacks, such as being costly without major benefits. The main advantage of RLHF is that the reward model can be trained separately on a different dataset and later used to create synthetic "chosen" and "rejected" datasets for other, more closed-loop reinforcement learning approaches like DPO (Direct Preference Optimization), IPO (Indirect Preference Optimization), and others.
