import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';
import { HttpCustomHeader } from '@shared/enums/http-custom-headers.enum';
import type {
  CreateExampleRequest,
  CreateExampleResponse,
  ExampleId,
  GetExampleDocumentResponse,
  GetExampleResponse,
  UpdateExampleRequest,
  UpdateExampleResponse,
} from './example.types';

@Injectable({
  providedIn: 'root',
})
export class ExampleService {
  // Injections
  private http = inject(HttpClient);

  // Methods
  public getExample(): Promise<GetExampleResponse> {
    return firstValueFrom(
      this.http.get<GetExampleResponse>('/example', {
        headers: {
          [HttpCustomHeader.CUSTOM_SUCCESS_MESSAGE]: 'customSuccess',
        },
      }),
    );
  }

  public createExample(
    body: CreateExampleRequest,
  ): Promise<CreateExampleResponse> {
    return firstValueFrom(
      this.http.post<CreateExampleResponse>('/example', body),
    );
  }

  public updateExample(
    id: ExampleId,
    body: UpdateExampleRequest,
  ): Promise<UpdateExampleResponse> {
    return firstValueFrom(
      this.http.put<UpdateExampleResponse>(`/example/${id}`, body),
    );
  }

  public getExampleDocument(): Promise<GetExampleDocumentResponse> {
    return firstValueFrom(
      this.http.get('/example/document', {
        responseType: 'blob',
      }),
    );
  }
}
