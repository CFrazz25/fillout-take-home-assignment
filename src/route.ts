import express, { Request, Response } from 'express';
import { calculatePageCount, callFilloutApi, filterResponses, recalculateFilteredResponsesLimitOffset } from './service';
import { ApiResponse, FilterClauseType, Responses } from './types';

const router = express.Router();

// in a real app, we would want to add some validation to the query params, and handle errors more gracefully, as well as move most of this to a controller like folder.
router.get('/:formId/filteredResponses', async (req: Request, res: Response) => {
  const formId = req.params.formId;
  const queryParams = req.query;
  const offset = queryParams.offset ? parseInt(queryParams.offset as string) : 0;
  const limit = queryParams.limit ? parseInt(queryParams.limit as string) : 150;
  const filters = req.query.filters;
  // disregard offset and limit params for now, we will handle them later after filtering the responses
  if (filters) {
    delete queryParams.offset;
    delete queryParams.limit;
    delete queryParams.filters;
  }
  let filtersObject: FilterClauseType[] = [];
  let filteredResponses: Responses = [];
  let totalResponses: number = 0;

  try {
    const apiResponse = await callFilloutApi({ formId, queryParams });
    // in a real app, if a response had more than 150 responses, we would need to make multiple requests to get all the responses, combine them, and then filter out.
    // however, in a real setting, the filtering would be done together with the API call, so we would not need to do this.
    if (filters && typeof filters === 'string') {
      const filtersString = decodeURIComponent(filters);
      filtersObject = JSON.parse(filtersString);
      filteredResponses = await filterResponses({ responses: apiResponse.responses, filters: filtersObject });
      totalResponses = filteredResponses.length;
      if (offset > 0 || limit < 150) {
        filteredResponses = await recalculateFilteredResponsesLimitOffset({ responses: filteredResponses, offset, limit })
      }
    } else {
      filteredResponses = apiResponse.responses;
      totalResponses = apiResponse.totalResponses;
    }

    const filteredApiResponse: ApiResponse = {
      responses: filteredResponses,
      totalResponses: totalResponses,
      pageCount: await calculatePageCount({ totalResponses, limit })
    };

    res.json(filteredApiResponse);
  } catch (error) {
    console.error('Error calling external API:', error);
    res.status(500).send('Internal Server Error'); // in a real app, we would want to send a more detailed error message, and map the error to a more specific status code
  }
});

export default router;
