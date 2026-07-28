//----------------------------------------------------------------
// DOMAIN DATA TYPES
//----------------------------------------------------------------

export type ExampleId = number;

export type ExampleData = {
  example: string;
};

//----------------------------------------------------------------
// API REQUEST / RESPONSE TYPES
//----------------------------------------------------------------

// getExample
export type GetExampleResponse = ExampleData;

// createExample
export type CreateExampleRequest = ExampleData;
export type CreateExampleResponse = {
  message: string;
  id: ExampleId;
};

// updateExample
export type UpdateExampleRequest = ExampleData;
export type UpdateExampleResponse = {
  message: string;
  id: ExampleId;
};

// getExampleDocument
export type GetExampleDocumentResponse = Blob;
