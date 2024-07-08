---
title: "Emotion Recognition Using Multi-Modal Data"
date: "2024-07-07"
---

## Overview

In this project, I explored the fascinating field of emotion recognition within affective computing. By using various data modalities, like video and audio, I aimed to enhance the accuracy of emotion detection. This project leveraged the Ryerson Audio-Visual Database of Emotional Speech and Song (RAVDESS), which includes videos and audio clips of actors portraying different emotions.

## Project Goals

- Investigate how different data modalities can improve emotion recognition.
- Compare the effectiveness of transformer-based architectures with traditional methods.
- Address challenges in implementing these models and propose solutions.

## Dataset

For this project, I used the RAVDESS dataset. It features 24 actors (12 male and 12 female) expressing seven different emotions: calm, happy, sad, angry, fearful, surprised, and disgusted. Each emotion is portrayed with varying intensity, and the dataset includes high-quality audio and video clips. I preprocessed the data to focus on cropped faces for better analysis.

## Methods

### Single Prediction for Video

1. **ResNet + LSTM**: This method uses a ResNet50 for generating image embeddings, which are then fed into a bidirectional LSTM to analyze the sequence of frames.
2. **ResNet + Transformer Encoder**: Similar to the ResNet + LSTM approach, but the embeddings are processed by a transformer encoder instead.
3. **3D ResNet**: This network uses 3D convolutions to simultaneously process spatial and temporal dimensions of the video frames.
4. **Multiscale Video Vision Transformer (MViTV2)**: An advanced model that integrates both spatial and temporal dimensions using a multiscale approach.

### Audio Classification

1. **1D CNN on Raw Audio**: A one-dimensional convolutional neural network processes the raw audio stream to generate embeddings for emotion classification.
2. **Mel Spectrogram + 2D CNN**: This approach converts audio data into Mel spectrograms, which are then analyzed using a two-dimensional CNN.

### Combined Audio and Video Model

I combined audio and video modalities using a merging layer that takes the latent representations from both encoders. This approach allows for a more comprehensive analysis of emotional cues.

## Experiments and Results

### Video Single Prediction

- **MViTV2**: Achieved high accuracy on the validation set, suggesting further training could improve results.
- **ResNet + LSTM**: Good performance, but with fluctuating validation loss and accuracy.
- **ResNet + Transformer**: Higher validation accuracy than the LSTM variant.
- **3D ResNet**: Lower performance compared to other methods.

### Audio Only Models

- **1D CNN on 16 Frames**: Low accuracy, indicating insufficient data length for emotion classification.
- **1D CNN on 64 Frames**: Improved accuracy, supporting the hypothesis that longer audio segments provide better classification results.

### Combined Audio + Video

- **MViTV2 + 1D CNN**: Slight improvement over video-only models, with further training showing significant gains in validation accuracy.

### Per Frame Prediction

- **ResNet + LSTM with Spectrogram**: High validation accuracy, demonstrating the effectiveness of combining video and audio modalities.

## Inference Methods

- **Queue-Based Prediction**: Uses a buffer of frames for continuous prediction, balancing speed and accuracy.
- **Per Frame Prediction**: Generates predictions for each frame, providing detailed analysis at the cost of processing time.

## Future Work

Future research could explore using a single transformer encoder to integrate all modalities, offering a unified approach for analyzing spatial and temporal data in emotion recognition.

---