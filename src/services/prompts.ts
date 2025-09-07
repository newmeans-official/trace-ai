import type { LocationInfo, TargetInfo } from '@/types'

export function buildBaseImagePrompt(target: Omit<TargetInfo, 'imageFile'>) {
  const gender =
    target.gender === 'unknown' ? 'Unknown' : target.gender === 'male' ? 'Male' : 'Female'
  const captureAge = typeof target.captureAge === 'number' ? String(target.captureAge) : 'Unknown'
  const age = typeof target.age === 'number' ? String(target.age) : 'Unknown'
  const ethnicity = target.ethnicity || 'Unknown'
  const features = target.features || 'None'
  return `
  Generate a high-resolution, photorealistic color portrait of a criminal suspect based on the provided montage sketch. The primary goal is to realistically age the individual depicted in the sketch to their current estimated age for identification purposes.


**Primary Directive: Maintain Likeness**
Your absolute top priority is to maintain a strong and faithful resemblance to the original montage sketch. The generated portrait must be immediately recognizable as the same individual, only aged. Treat the sketch as the ground truth for the fundamental facial structure, bone shape, and the precise proportions and placement of all features. All other instructions are secondary to this core objective.


**Scene Description & Context:**

The provided image is a police sketch created when the suspect, a ${gender} of ${ethnicity} descent, was estimated to be ${captureAge} years old.

Your task is to transform this sketch into a photorealistic portrait, aging the individual to their current estimated age of ${age} years. You must accurately translate the core facial structure, bone shape, and key features from the sketch while applying natural signs of aging. This includes realistic wrinkles, changes in skin texture and elasticity, and potential hair color changes (e.g., graying) that are appropriate for their current age.

If available, incorporate these distinguishing features naturally into the portrait: ${features}.

**Photographic Style & Technical Details:**

*   **Style:** The final image must be a photorealistic photograph, not a drawing, illustration, or CGI-style rendering. It should resemble a modern digital mugshot or a passport photo.
*   **Camera & Angle:** The perspective must be a direct, front-facing shot of the head and shoulders. Use a standard portrait lens setting to ensure the facial features are not distorted.
*   **Lighting:** Employ neutral, even studio lighting that clearly illuminates the face and minimizes harsh shadows, ensuring all details are visible.
*   **Details:** Render realistic skin texture, including pores and fine lines. The eyes should appear lifelike and clear.
*   **Background:** The background should be simple and out of focus, using a neutral color like light gray or blue, to keep the entire focus on the suspect's face.`
}

export function buildKeywordPrompt(location: LocationInfo, target: Omit<TargetInfo, 'imageFile'>) {
  const gender =
    target.gender === 'unknown' ? 'Unknown' : target.gender === 'male' ? 'Male' : 'Female'
  const ageText =
    typeof target.captureAge === 'number'
      ? `${target.captureAge} years`
      : typeof target.age === 'number'
        ? `${target.age} years`
        : 'Unknown'
  const ethnicity = target.ethnicity || 'Unknown'
  const features = (target.features || 'None').trim() || 'None'
  const neighborhood = (location as any).neighborhood || 'Not specified'

  return `
**[ROLE & GOAL]**

You are an expert criminal profiler and intelligence analyst. Your mission is to generate a diverse portfolio of approximately 10 highly plausible disguise scenarios for a fugitive. Your analysis must be grounded in established principles of criminal psychology to predict the fugitive's likely behavior under the stress of being on the run. The output must provide actionable intelligence and a clear visual modification profile for an existing photograph.

**[ETHICAL GUIDELINE - CRITICAL]**

Your analysis must be based on verifiable data. AVOID racial or social stereotypes. The objective is to identify roles and environments of high anonymity and low scrutiny for blending in, NOT to associate any group with criminal behavior.

**[CONTEXT]**

- Fugitive Profile:
    - Country: ${location.country}
    - City: ${location.city}
    - Target Neighborhood (Optional): ${neighborhood}
    - Age: ${ageText}
    - Gender: ${gender}
    - Race/Ethnicity: ${ethnicity}
    - Known Features: ${features}

**[CORE ANALYTICAL FRAMEWORK]**

You must adhere to the following principles for every scenario generated:

- The Unbreakable Rule: Low Barrier to Entry
    - Permitted: Roles requiring no ID, no background check, no formal qualifications, high turnover, and potential for cash payment. This includes non-occupational roles.
    - Forbidden: Roles requiring degrees, licenses, official registration, or significant, verifiable trust.
- Criminal Psychology Principles of Evasion:
    - Principle of Minimal Social Footprint: Fugitives seek anonymity, preferring roles that require minimal, superficial social interaction.
    - Principle of Cognitive Comfort: Under stress, fugitives gravitate towards what is familiar, leveraging past skills in a simplified form.
    - Principle of Paranoid Vigilance: Fugitives prefer environments with blind spots (limited CCTV), multiple escape routes, and a lack of official oversight.

**[PERSONA GENERATION STRATEGY & DISTRIBUTION]**

Generate a portfolio of approximately 10 personas, intelligently distributed across the following categories. Do not exclusively focus on the Known Features.

- A. Feature-Based Personas (Approx. 2): Scenarios that leverage the fugitive's Known Features through the lens of the Principle of Cognitive Comfort.
- B. Neighborhood-Specific Personas (Approx. 3): Scenarios that leverage the unique micro-culture of a specific district or 'dong' (동네) within the city. This requires a granular analysis of local hangouts, community centers, or specific street-level economies.
    - Note: If a Target Neighborhood is provided in the context, these personas must be specific to that area. If not, select plausible high-anonymity neighborhoods within the city for your analysis.
- C. City-Specific Personas (Approx. 2): Scenarios that leverage unique subcultures or informal economies of the target CITY as a whole.
- D. Country-Specific Personas (Approx. 2): Scenarios characteristic of the COUNTRY's broader culture or informal economy.
- E. Generic High-Plausibility Personas (Approx. 2): Universal, low-barrier roles applicable to most large cities.

**[OUTPUT GENERATION REQUIREMENTS]**

For each persona, provide the following three outputs:

- keyword (English): A concise, neutral noun phrase.
- reasoning (English): Ultra-condensed, single line in EXACT format — "Barrier: [No-ID, Cash-Pay, Night-shift, etc.] | Psych: [Minimal Social Footprint | Cognitive Comfort | Paranoid Vigilance] | Cat: [A|B|C|D|E]".
- disguise_prompt (English): STRICT chest-up portrait modification only. Do NOT describe inherent features (age, race, face shape) or anything below the chest (hands, waist, props). Do NOT describe pose/actions. Use this exact structure as a single paragraph:

    MODIFICATIONS: Clothing is [detailed clothing visible on chest/shoulders], hair is [style/condition], accessories are [e.g., glasses, beanie, none]. STRESS INDICATORS: Expression is [e.g., paranoid, weary, vacant], skin appears [e.g., sallow, dehydrated, stress-induced acne], eyes are [e.g., bloodshot with dark circles, constantly scanning]. FORMAT: Chest-up studio portrait, subject facing camera directly, plain white background.

**[OUTPUT FORMAT]**

Provide your response as a single, valid JSON object only, with no additional text. The JSON object must contain the three primary keys: "Occupation/Status", "Environmental Blending", and "Short-term Labor". The value for each key must be a list (array) of persona objects. Every persona object inside the list must contain exactly three string keys: "keyword", "reasoning", and "disguise_prompt".

Return ONLY this JSON object.
`
}

export function buildSeasonPrompt(season: 'Summer' | 'Winter' | 'Spring') {
  return `Generate a fashion/appearance variation for season: ${season}. Same person, photorealistic.`
}

// Central prompt builder for disguise-based image generation
export function buildImagePrompt(disguisePrompt: string) {
  return `draw ${disguisePrompt}`
}
