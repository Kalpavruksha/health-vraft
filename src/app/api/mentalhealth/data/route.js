import { NextResponse } from 'next/server';
import { connectDB } from '@/lib/db';
import MentalHealth from '@/models/MentalHealth';
import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function POST(request) {
  try {
    const body = await request.json();
    await connectDB();

    const newRecord = new MentalHealth(body);
    await newRecord.save();

    // Generate AI recommendation
    const recommendation = await generateAIRecommendation(body);

    return NextResponse.json({
      message: 'Data saved successfully',
      recommendation: recommendation,
    });

  } catch (error) {
    console.error('Error processing POST request:', error);
    return NextResponse.json({ error: 'Failed to save data' }, { status: 500 });
  }
}

async function generateAIRecommendation(data) {
  const { mood, stressLevel, sleepHours, anxiety, depression, energyLevel, thoughts } = data;
  
  const prompt = `As a mental health AI assistant, provide a personalized recommendation based on the following user data:
  - Current mood: ${mood}
  - Stress level (1-10): ${stressLevel}
  - Sleep hours: ${sleepHours}
  - Anxiety level (1-10): ${anxiety}
  - Depression level (1-10): ${depression}
  - Energy level (1-10): ${energyLevel}
  - Additional thoughts: ${thoughts || 'None provided'}

  Please provide:
  1. A brief analysis of their current mental health state
  2. 2-3 specific, actionable recommendations
  3. A supportive message encouraging professional help if needed
  Keep the response concise, empathetic, and focused on practical steps.`;

  try {
    const completion = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [
        {
          role: "system",
          content: "You are a compassionate mental health AI assistant. Provide supportive, practical recommendations while always encouraging professional help when appropriate."
        },
        {
          role: "user",
          content: prompt
        }
      ],
      temperature: 0.7,
      max_tokens: 300
    });

    return completion.choices[0].message.content.trim();
  } catch (error) {
    console.error('Error generating AI recommendation:', error);
    // Fallback to basic recommendations if AI fails
    return generateFallbackRecommendation(data);
  }
}

function generateFallbackRecommendation(data) {
  const { mood, stressLevel, sleepHours, anxiety, depression, energyLevel } = data;
  
  let recommendations = [];

  // Mood-based recommendations
  if (mood === 'sad' || mood === 'frustrated' || mood === 'angry' || mood === 'anxious' || mood === 'overwhelmed') {
    recommendations.push("Consider practicing deep breathing exercises or mindfulness meditation to help manage your emotions.");
  }

  // Stress level recommendations
  if (stressLevel >= 7) {
    recommendations.push("Your stress level is high. Try taking short breaks throughout the day and engaging in physical activity.");
  }

  // Sleep recommendations
  if (sleepHours < 6) {
    recommendations.push("You might be sleep deprived. Try to establish a regular sleep schedule and create a relaxing bedtime routine.");
  } else if (sleepHours > 10) {
    recommendations.push("You're sleeping more than usual. Consider maintaining a regular sleep schedule and engaging in daytime activities.");
  }

  // Anxiety recommendations
  if (anxiety >= 7) {
    recommendations.push("Your anxiety level is high. Consider practicing grounding techniques or reaching out to a trusted friend or family member.");
  }

  // Depression recommendations
  if (depression >= 7) {
    recommendations.push("You're experiencing significant depressive symptoms. Consider reaching out to a mental health professional for support.");
  }

  // Energy level recommendations
  if (energyLevel <= 3) {
    recommendations.push("Your energy level is low. Try to maintain a balanced diet, stay hydrated, and engage in light physical activity.");
  }

  // If no specific recommendations were generated
  if (recommendations.length === 0) {
    recommendations.push("Keep up the good work! Continue monitoring your mental health and reach out for support if needed.");
  }

  // Add general support message
  recommendations.push("Remember that it's okay to seek professional help if you're struggling. Your mental health is important.");

  return recommendations.join(" ");
}
