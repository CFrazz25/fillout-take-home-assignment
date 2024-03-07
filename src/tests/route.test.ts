import request from 'supertest';
import { listener } from '../app';

describe('GET /:formId/filteredResponses', () => {
  it('responds with no responses', async () => {
    const formId = 'cLZojxk94ous';
    const filters = encodeURIComponent(JSON.stringify([{ id: "nameId", condition: "equals", value: "Timmy" }]));
    const response = await request(listener)
      .get(`/${formId}/filteredResponses?filters=${filters}`)
      .expect('Content-Type', /json/)
      .expect(200);

    expect(response.body).toEqual({
      responses: [],
      totalResponses: 0,
      pageCount: 0
    });
  });

  it('handles query params besides filtering', async () => {
    const formId = 'cLZojxk94ous';
    const response = await request(listener)
      .get(`/${formId}/filteredResponses?limit=1`)
      .expect('Content-Type', /json/)
      .expect(200);

    expect(response.body).toEqual({
      "responses": [
        {
          "submissionId": "ab9959b2-73e8-4994-85b9-56e780b89ce3",
          "submissionTime": "2024-02-27T19:37:08.228Z",
          "lastUpdatedAt": "2024-02-27T19:37:08.228Z",
          "questions": [
            {
              "id": "4KC356y4M6W8jHPKx9QfEy",
              "name": "Anything else you'd like to share before your call?",
              "type": "LongAnswer",
              "value": "Nothing much to share yet!"
            },
            {
              "id": "bE2Bo4cGUv49cjnqZ4UnkW",
              "name": "What is your name?",
              "type": "ShortAnswer",
              "value": "Johnny"
            },
            {
              "id": "dSRAe3hygqVwTpPK69p5td",
              "name": "Please select a date to schedule your yearly check-in.",
              "type": "DatePicker",
              "value": "2024-02-01"
            },
            {
              "id": "fFnyxwWa3KV6nBdfBDCHEA",
              "name": "How many employees work under you?",
              "type": "NumberInput",
              "value": 2
            },
            {
              "id": "jB2qDRcXQ8Pjo1kg3jre2J",
              "name": "Which department do you work in?",
              "type": "MultipleChoice",
              "value": "Engineering"
            },
            {
              "id": "kc6S6ThWu3cT5PVZkwKUg4",
              "name": "What is your email?",
              "type": "EmailInput",
              "value": "johnny@fillout.com"
            }
          ],
          "calculations": [],
          "urlParameters": [],
          "quiz": {},
          "documents": []
        }
      ],
      "totalResponses": 13,
      "pageCount": 13
    }
    );
  });

  it('responds with one response', async () => {
    const formId = 'cLZojxk94ous';
    const filters = encodeURIComponent(JSON.stringify([{ id: "bE2Bo4cGUv49cjnqZ4UnkW", condition: "equals", value: "Johnny" }]));
    const response = await request(listener)
      .get(`/${formId}/filteredResponses?filters=${filters}`)
      .expect('Content-Type', /json/)
      .expect(200);

    expect(response.body.totalResponses).toEqual(1);
  });

  it('responds with 6 responses', async () => {
    const formId = 'cLZojxk94ous';
    const filters = encodeURIComponent(JSON.stringify([{ id: "bE2Bo4cGUv49cjnqZ4UnkW", condition: "does_not_equal", value: "Johnny" },
    { id: "bE2Bo4cGUv49cjnqZ4UnkW", condition: "does_not_equal", value: "Jane" },
    { id: "fFnyxwWa3KV6nBdfBDCHEA", condition: "greater_than", value: 0 }]));
    const response = await request(listener)
      .get(`/${formId}/filteredResponses?filters=${filters}`)
      .expect('Content-Type', /json/)
      .expect(200);

    expect(response.body.totalResponses).toEqual(6);
  });

  it('handles null conditions', async () => {
    const formId = 'cLZojxk94ous';
    const filters = encodeURIComponent(JSON.stringify([{ id: "bE2Bo4cGUv49cjnqZ4UnkW", condition: "equals", value: null }]));
    const response = await request(listener)
      .get(`/${formId}/filteredResponses?filters=${filters}`)
      .expect('Content-Type', /json/)
      .expect(200);

    expect(response.body.totalResponses).toEqual(2);
  });

  it('handles other query params', async () => {
    const formId = 'cLZojxk94ous';
    const filters = encodeURIComponent(JSON.stringify([{ id: "jB2qDRcXQ8Pjo1kg3jre2J", condition: "does_not_equal", value: "Human resources" }]));
    const response = await request(listener)
      .get(`/${formId}/filteredResponses?filters=${filters}&afterDate=2024-02-28T13:37:08.228Z&limit=1&offset=1`)
      .expect('Content-Type', /json/)
      .expect(200);

    expect(response.body.totalResponses).toEqual(6);
    expect(response.body.responses[0].questions[0].value).toEqual("Nope");
    expect(response.body.pageCount).toEqual(6);
  });

  it('throws error for invalid query params', async () => {
    const formId = 'cLZojxk94ous';
    const filters = encodeURIComponent(JSON.stringify([{ id: "jB2qDRcXQ8Pjo1kg3jre2J", condition: "does_not_equal", value: "Human resources" }]));
    await request(listener)
      .get(`/${formId}/filteredResponses?filters=${filters}&afterDate=2024-02-28T13:37:08.228Z&limit=1&offset=1&sort=invalidparam`)
      .expect(500);


  });
});

afterAll((done) => {
  listener.close(done);
});
