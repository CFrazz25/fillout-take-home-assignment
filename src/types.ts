type FilterClauseType = {
  id: string;
  condition: 'equals' | 'does_not_equal' | 'greater_than' | 'less_than';
  value: number | string;
}

type Question = {
  id: string;
  name: string;
  type: string;
  value: string | number;
}

type Response = {
  submissionId: string;
  submissionTime: string;
  lastUpdatedAt: string;
  questions: Question[];
  calculations: any[];
  urlParameters: any[];
  quiz: any[];
  document: any[];
}

type Responses = Response[];

type ApiResponse = {
  responses: Responses;
  totalResponses: number;
  pageCount: number;
}

export { FilterClauseType, Responses, Response, Question, ApiResponse };