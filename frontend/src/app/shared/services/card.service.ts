import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { ICard } from '../models/board.model';

interface IReorderCardItem {
  id: number;
  order: number;
  swimlaneId: number;
}

@Injectable({
  providedIn: 'root',
})
export class CardService {
  http = inject(HttpClient);

  updateCardOrdersAndSwimlanes(
    boardId: number,
    cards: ICard[]
  ): Observable<ICard[]> {
    // Only send required fields to avoid validation errors
    const reorderCards: IReorderCardItem[] = cards.map((c) => ({
      id: c.id,
      order: c.order,
      swimlaneId: c.swimlaneId,
    }));
    return this.http.put<ICard[]>('/api/card/update-order', {
      boardId,
      cards: reorderCards,
    });
  }
  createCard(createCard: Partial<ICard>): Observable<ICard> {
    return this.http.post<ICard>('/api/card', createCard);
  }
  updateCard(id: number, createCard: Partial<ICard>): Observable<ICard> {
    return this.http.patch<ICard>(`/api/card/${id}`, createCard);
  }
  deleteCard(cardId: number): Observable<void> {
    return this.http.delete<void>(`/api/card/${cardId}`);
  }
  getCardById(id: number): Observable<ICard> {
    return this.http.get<ICard>(`/api/card/${id}`);
  }
  getCards(): Observable<ICard[]> {
    return this.http.get<ICard[]>('/api/card');
  }
}
