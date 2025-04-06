export interface Function {
  name: string;
  description: string;
  parameters: {
    type: string;
    properties: Record<string, any>;
    required?: string[];
  };
  implementation: (params: any) => Promise<any>;
}
