// WebLLM Browser On-Device Inference Engine for AGY Dungeon
// Enables true client-side zero-cloud AI execution via WebGPU

export interface ModelLoadProgress {
  progress: number;
  text: string;
}

class WebLLMEngine {
  private engine: any = null;
  private isInitializing: boolean = false;
  private isLoaded: boolean = false;
  private currentModel: string = 'SmolLM2-135M-Instruct-q0f16-MLC';

  public async checkWebGPUSupport(): Promise<boolean> {
    if (typeof navigator !== 'undefined' && (navigator as any).gpu) {
      try {
        const adapter = await (navigator as any).gpu.requestAdapter();
        return !!adapter;
      } catch {
        return false;
      }
    }
    return false;
  }

  public getIsLoaded(): boolean {
    return this.isLoaded;
  }

  public getIsInitializing(): boolean {
    return this.isInitializing;
  }

  public async loadModel(
    modelName: string = 'SmolLM2-135M-Instruct-q0f16-MLC',
    onProgress?: (progress: ModelLoadProgress) => void
  ): Promise<boolean> {
    if (this.isLoaded && this.currentModel === modelName && this.engine) {
      return true;
    }

    const hasWebGPU = await this.checkWebGPUSupport();
    if (!hasWebGPU) {
      throw new Error('WebGPU is not supported or enabled on this browser/device.');
    }

    this.isInitializing = true;
    this.currentModel = modelName;

    try {
      // Dynamically import web-llm so bundle remains lightweight
      const { CreateMLCEngine } = await import('@mlc-ai/web-llm');

      this.engine = await CreateMLCEngine(modelName, {
        initProgressCallback: (report) => {
          if (onProgress) {
            onProgress({
              progress: Math.round(report.progress * 100),
              text: report.text,
            });
          }
        },
      });

      this.isLoaded = true;
      this.isInitializing = false;
      return true;
    } catch (err) {
      this.isInitializing = false;
      this.isLoaded = false;
      console.error('Failed to load WebLLM model:', err);
      throw err;
    }
  }

  public async generate(prompt: string, systemPrompt?: string): Promise<string> {
    if (!this.engine || !this.isLoaded) {
      throw new Error('WebLLM engine is not loaded yet.');
    }

    const messages = [
      {
        role: 'system',
        content:
          systemPrompt ||
          'You are Jev, the System-One Grandmaster AI DM of AGY Dungeon. You govern reality across [NULL], [CHOICE], and [RADIANT]. Keep responses gritty, sci-fi cyberpunk terminal style, under 50 words.',
      },
      {
        role: 'user',
        content: prompt,
      },
    ];

    const reply = await this.engine.chat.completions.create({
      messages,
      temperature: 0.8,
      max_tokens: 100,
    });

    return reply.choices[0]?.message?.content || '';
  }

  public unload() {
    if (this.engine) {
      try {
        this.engine.unload();
      } catch {}
      this.engine = null;
    }
    this.isLoaded = false;
    this.isInitializing = false;
  }
}

export const webllmEngine = new WebLLMEngine();
