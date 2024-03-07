import axios from 'axios';
import { ApiResponse, FilterClauseType, Responses } from './types';

async function callFilloutApi({ formId, queryParams }: { formId: string, queryParams: any }): Promise<ApiResponse> {
  const apiUrl = `https://api.fillout.com/v1/api/forms/${formId}/submissions`;
  const token = 'sk_prod_TfMbARhdgues5AuIosvvdAC9WsA5kXiZlW8HZPaRDlIbCpSpLsXBeZO7dCVZQwHAY3P4VSBPiiC33poZ1tdUj2ljOzdTCCOSpUZ_3912';

  try {
    const response = await axios.get(apiUrl, {
      params: queryParams,
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });

    return response.data;
  } catch (error) {
    console.error('Failed to call external API:', error);
    throw error; // Rethrow the error to be handled by the caller
  }
}

async function filterResponses({ responses, filters }: { responses: Responses, filters: FilterClauseType[] }): Promise<Responses> {
  let filteredResponses: Responses = [];

  for (let i = 0; i < responses.length; i++) {
    let response = responses[i];
    let questions = response.questions;
    let passed = true;

    for (let j = 0; j < filters.length; j++) {
      let filter = filters[j];
      let question = questions.find(q => q.id === filter.id);

      if (question) {
        switch (filter.condition) {
          case 'equals':
            if (question.value !== filter.value) {
              passed = false;
            }
            break;
          case 'does_not_equal':
            if (question.value === filter.value) {
              passed = false;
            }
            break;
          case 'greater_than':
            if (!question.value) {
              passed = false;
            }
            if (typeof question.value == typeof filter.value && question.value <= filter.value) {
              passed = false;
            }
            break;
          case 'less_than':
            if (!question.value) {
              passed = false;
            }
            if (typeof question.value == typeof filter.value && question.value >= filter.value) {
              passed = false;
            }
            break;
          default:
            break;
        }
      } else {
        passed = false;
      }
    }

    if (passed) {
      filteredResponses.push(response);
    }
  }

  return filteredResponses;
}

async function recalculateFilteredResponsesLimitOffset({ responses, limit, offset }: { responses: Responses, limit: number, offset: number }): Promise<Responses> {
  let recalculateResponses: Responses = [];
  let start = offset;
  let end = limit + offset;
  for (let i = start; i < end; i++) {
    recalculateResponses.push(responses[i]);
  }
  return recalculateResponses;
}

async function calculatePageCount({ totalResponses, limit }: { totalResponses: number, limit: number }): Promise<number> {
  const pageCount = Math.ceil(totalResponses / limit);
  return pageCount;
}

export { callFilloutApi, filterResponses, calculatePageCount, recalculateFilteredResponsesLimitOffset };