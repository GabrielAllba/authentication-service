export interface ErrorMessage {
  indonesia: string;
  english: string;
}

export interface ErrorSchema {
  error_code: string;
  error_message: ErrorMessage;
}

export class StandardResponse<OutputSchema> {
  error_schema: ErrorSchema;
  output_schema: OutputSchema;

  constructor(error_schema: ErrorSchema, output_schema: OutputSchema) {
    this.error_schema = error_schema;
    this.output_schema = output_schema;
  }
}
