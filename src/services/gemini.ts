import { CarbonResult, CarbonBreakdown } from '../types';

export interface ChatMessage {
  role: 'user' | 'model';
  content: string;
}

export async function askGeminiCoach(
  prompt: string,
  history: ChatMessage[],
  apiKey?: string,
  result?: CarbonResult | null
): Promise<string> {
  if (apiKey && apiKey.trim().length > 10) {
    try {
      const contents = history.map(h => ({
        role: h.role === 'model' ? 'model' : 'user',
        parts: [{ text: h.content }]
      }));
      
      // Add system context and the current user request
      const systemContext = `You are "EcoCoach AI", an expert sustainability advisor integrated into the EcoTracker AI carbon platform. 
The user has a sustainability score of ${result?.score ?? 'unknown'}/100. 
Their monthly emissions: ${result?.totalMonthlyEmissions ?? 'unknown'} kg CO2.
Breakdown: Transportation ${result?.breakdown.transportation ?? 'unknown'} kg, Electricity ${result?.breakdown.electricity ?? 'unknown'} kg, Food ${result?.breakdown.food ?? 'unknown'} kg, Shopping ${result?.breakdown.shopping ?? 'unknown'} kg, Waste ${result?.breakdown.waste ?? 'unknown'} kg, Water ${result?.breakdown.water ?? 'unknown'} kg.
Provide encouraging, action-oriented, and highly practical carbon reduction advice in Markdown format. Keep responses concise and focused on high-impact, easy-to-adopt habits. Do not use generic introductions.`;

      // Prepend context to the first query or user query
      const fullContents = [
        {
          role: 'user',
          parts: [{ text: `${systemContext}\n\nUser Question: ${prompt}` }]
        },
        ...contents.slice(Math.max(0, contents.length - 6)) // Include last 6 messages of history
      ];

      // If the last message in history is the current user request, replace/use that
      const response = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ contents: fullContents })
        }
      );

      if (!response.ok) {
        throw new Error(`API Error: ${response.statusText}`);
      }

      const resData = await response.json();
      const text = resData.candidates?.[0]?.content?.parts?.[0]?.text;
      if (text) return text;
      throw new Error('Empty response from Gemini API');
    } catch (e: any) {
      console.warn("Gemini API call failed, falling back to local coach simulator:", e.message);
      // Fallback below
    }
  }

  // Local Sustainability AI Coach Fallback Simulation
  await new Promise(resolve => setTimeout(resolve, 800)); // Simulate thinking latency
  const lower = prompt.toLowerCase();

  const scoreText = result ? `Your current Carbon Footprint Score is **${result.score}/100** (${result.rating} Rating).` : '';
  const highestSource = result ? getHighestEmissionSource(result.breakdown) : 'transportation';

  if (lower.includes('transport') || lower.includes('car') || lower.includes('flight') || lower.includes('travel') || lower.includes('commute')) {
    return `### 🚗 EcoCoach Transportation Insights
${scoreText} 

Transportation represents a major share of individual carbon emissions. In your case, it contributes **${result?.breakdown.transportation ?? 240} kg CO2/month**.

**High-Impact Reduction Actions:**
1. **Ditch the Single-Occupancy Car**: Walking, biking, or electric transit saves up to **90%** of CO2 emissions compared to driving a fuel-burning car.
2. **Eco-Driving Habits**: Maintaining steady speeds, keeping tires properly inflated, and removing roof racks can improve your miles-per-gallon (MPG) by **10-15%**.
3. **Minimize Air Travel**: Direct flights emit significant radiative forcing in the upper atmosphere. Consider trains for regional trips, or offset flight carbon directly.

Would you like me to map out a public transit or cycling route for one of your regular commutes?`;
  }

  if (lower.includes('electric') || lower.includes('power') || lower.includes('solar') || lower.includes('kwh') || lower.includes('light') || lower.includes('bulb')) {
    return `### ⚡ EcoCoach Home Energy Insights
${scoreText} 

Electricity generation is one of the leading global carbon sources. Your household electricity footprint is **${result?.breakdown.electricity ?? 180} kg CO2/month**.

**Top Optimization Recommendations:**
1. **Switch to 100% Clean Energy**: Check if your electricity provider offers a green power plan option (often solar/wind generated). This single action can slash your power emissions to **zero**!
2. **Defeat Phantom Loads**: Standard electronic devices (tvs, computer screens, chargers) consume electricity even when idle. Unplug them or use smart power strips to save up to **$100/year** on bills.
3. **LED Upgrades**: LEDs use **75-80% less energy** than traditional incandescent bulbs and last 25 times longer.

I've added an "Upgrade Bulbs to LED" task to your Eco Action Plan!`;
  }

  if (lower.includes('food') || lower.includes('meat') || lower.includes('beef') || lower.includes('diet') || lower.includes('vegan') || lower.includes('dairy')) {
    return `### 🥗 EcoCoach Food & Agriculture Insights
${scoreText}

What we eat has a direct impact on land clearing and agricultural methane emissions. Your food habits contribute **${result?.breakdown.food ?? 150} kg CO2/month**.

**Eco-Friendly Diet Actions:**
1. **Reduce Beef & Lamb**: Beef requires **20x more land** and generates **20x more emissions** per gram of protein than plant proteins like beans or tofu.
2. **Minimize Food Waste**: About **30% of global food** is wasted. Planning meals and composting scraps reduces landfill methane emissions significantly.
3. **Local & Seasonal**: Buying local reduces transportation emissions and supports regional soil conservation.

Try replacing beef with plant proteins for just two dinners this week. You'll save around **10 kg of CO2**!`;
  }

  if (lower.includes('waste') || lower.includes('recycle') || lower.includes('plastic') || lower.includes('trash')) {
    return `### ♻️ EcoCoach Waste Management Advice
${scoreText}

Landfilled waste undergoes anaerobic decomposition, releasing methane—a greenhouse gas **28 times more potent** than CO2. Your waste contribution is **${result?.breakdown.waste ?? 45} kg CO2/month**.

**Quick Wins:**
1. **Adopt a Circular Mindset**: Choose items with minimal packaging or buy in bulk.
2. **Composting**: Diverting organic food waste into backyard composters keeps it aerated, eliminating methane production.
3. **Strict Sorting**: Ensure cardboard, glass, aluminum, and plastics (PET/HDPE) are clean before recycling. Clean materials increase recycling viability.

Would you like to try the **30-Day Zero-Waste Warrior** Challenge? It will help build sustainable waste separation habits!`;
  }

  if (lower.includes('water') || lower.includes('shower') || lower.includes('laundry')) {
    return `### 💧 EcoCoach Water Footprint Advice
${scoreText}

Pumping, treating, and heating water require significant grid electricity. Your water-heating energy footprint stands at **${result?.breakdown.water ?? 35} kg CO2/month**.

**Action Plan:**
1. **Shower Timer**: Shortening showers from 10 minutes to 5 minutes cuts carbon emissions by **50%** and saves thousands of gallons of clean water annually.
2. **Cold Laundry Cycles**: 75-90% of a washing machine's energy goes toward heating water. Cold water detergents clean effectively without the heat.
3. **Low-Flow Aerators**: Installing inexpensive aerators on faucets limits water flow without reducing pressure.

Switching to cold laundry cycles is an easy task that can save you **0.6 kg CO2** per load.`;
  }

  if (lower.includes('offset') || lower.includes('tree') || lower.includes('project') || lower.includes('neutral')) {
    return `### 🌱 Understanding Carbon Offsets
Carbon offsets allow you to invest in environmental projects (like forestry conservation, solar fields, or biochar production) to balance out your remaining carbon footprint.

**Best Practices:**
- **Assess and Reduce First**: Offsets should never replace direct lifestyle changes. They are the "last mile" option.
- **Verification Matters**: Look for projects certified by Gold Standard, VCS (Verified Carbon Standard), or Climate Action Reserve.
- **Support Co-benefits**: Choose projects that also support local employment, biodiversity protection, or clean water access.

You currently have **${result?.totalAnnualEmissions ?? 4800} kg CO2** of annual emissions. Supporting 5 tree-planting projects ($15) can offset about **300 kg CO2**!`;
  }

  // Default AI response incorporating user statistics
  return `### Hello! I am your AI EcoCoach 🤖🌱

I analyze your lifestyle data and help you design high-yield, realistic strategies to reduce your greenhouse gas emissions.

${result ? `Based on your footprint analysis, your monthly emissions are **${result.totalMonthlyEmissions} kg CO2**. 

Your highest impact category is **${highestSource.toUpperCase()}** (${result.breakdown[highestSource as keyof CarbonBreakdown]} kg CO2). 
` : 'Please complete the carbon footprint assessment so I can review your custom data!'}

**How can I help you today?**
- *How can I reduce my transportation emissions?*
- *What household energy habits hurt the environment?*
- *How does my diet impact my carbon footprint?*
- *Can you explain carbon offsetting and how to start?*
`;
}

function getHighestEmissionSource(breakdown: CarbonBreakdown): string {
  let maxCat = 'transportation';
  let maxVal = breakdown.transportation;
  
  if (breakdown.electricity > maxVal) { maxVal = breakdown.electricity; maxCat = 'electricity'; }
  if (breakdown.food > maxVal) { maxVal = breakdown.food; maxCat = 'food'; }
  if (breakdown.shopping > maxVal) { maxVal = breakdown.shopping; maxCat = 'shopping'; }
  if (breakdown.waste > maxVal) { maxVal = breakdown.waste; maxCat = 'waste'; }
  if (breakdown.water > maxVal) { maxVal = breakdown.water; maxCat = 'water'; }
  
  return maxCat;
}
export function getEmissionImprovements(breakdown: CarbonBreakdown): { category: string; percent: number; suggestion: string }[] {
  const total = (Object.values(breakdown) as number[]).reduce((a: number, b: number) => a + b, 0) || 1;
  const list = [
    { category: 'Transportation', value: breakdown.transportation, suggestion: 'Switch to transit, walking, or hybrid/electric driving' },
    { category: 'Electricity', value: breakdown.electricity, suggestion: 'Unplug standby devices, switch to LEDs, and buy green power' },
    { category: 'Food Habits', value: breakdown.food, suggestion: 'Reduce red meat intake and buy organic/local produce' },
    { category: 'Shopping', value: breakdown.shopping, suggestion: 'Buy second-hand, choose repairable goods, and limit electronics upgrades' },
    { category: 'Waste', value: breakdown.waste, suggestion: 'Sort recyclables strictly and start composting food waste' },
    { category: 'Water Usage', value: breakdown.water, suggestion: 'Reduce shower times to 5 minutes and wash clothes in cold water' },
  ];

  return list
    .map(item => ({
      category: item.category,
      percent: Math.round((item.value / total) * 100),
      suggestion: item.suggestion
    }))
    .sort((a, b) => b.percent - a.percent);
}
