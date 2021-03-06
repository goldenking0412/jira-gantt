import xs, { Stream } from 'xstream'
import { JiraProjectResponse } from './project'
import { JiraSearchBody, JiraSearchResponse } from './search'


export class Api {
  private headers: { [key: string]: string }

  get<ResponseBody>(url: string): Stream<ResponseBody> {
    const promise = fetch(url, { headers: this.headers })
      .then(this.checkStatus)
      .then(res => res.json<ResponseBody>())
    return xs.fromPromise(promise)
  }

  post<ResponseBody>(url: string, data: Object, auth: string): Stream<ResponseBody> {
    const params = {
      method: 'POST',
      headers: {
        ...this.headers,
        'Content-Type': 'application/json',
        'Authorization': `Basic ${window.btoa(auth)}`,
      },
      body: JSON.stringify(data),
    }
    const promise = fetch(url, params)
      .then(this.checkStatus)
      .then(res => res.json<ResponseBody>())
    return xs.fromPromise(promise)
  }

  private checkStatus(res: Response): Response {
    if (res.status >= 200 && res.status < 300) {
      return res
    }
    throw new Error(res.statusText)
  }
}


export class JiraApi {
  private api: Api

  constructor() {
    this.api = new Api()
  }

  getProject(projectKey: string) {
    return this.api.get<JiraProjectResponse>(`/jira/api/2/project/${projectKey}`)
  }

  getIssuesForVersion(version: string, auth: string) {
    const data: JiraSearchBody = {
      jql: `fixVersion = '${version}'`,
      fields: [
        'priority',
        'status',
        'components',
        'creator',
        'reporter',
        'issuetype',
        'description',
        'summary',
        'progress',
        'timeestimate',
        'timeoriginalestimate',
        'assignee',
      ],
    }

    return this.api.post<JiraSearchResponse>('/jira/api/2/search/', data, auth)
  }
}
