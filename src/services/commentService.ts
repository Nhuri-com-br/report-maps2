/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { 
  collection, 
  query, 
  orderBy, 
  onSnapshot, 
  serverTimestamp, 
  doc, 
  setDoc, 
  increment, 
  updateDoc 
} from 'firebase/firestore';
import { db, auth, handleFirestoreError, OperationType } from '../lib/firebase';
import { Comment } from '../types';

const getCommentsPath = (issueId: string) => `issues/${issueId}/comments`;

// Comentários de exemplo para o fórum da apresentação do TCC
const DEMO_COMMENTS: Record<string, Comment[]> = {
  'demo-1': [
    {
      id: 'c1',
      issueId: 'demo-1',
      userId: 'user-c1',
      userName: 'Luciana Martins (Moradora)',
      text: 'Passei de moto hoje cedo e quase caí! Buraco muito fundo, precisa de asfalto urgente.',
      createdAt: Date.now() - 1000 * 60 * 60 * 20,
    },
    {
      id: 'c2',
      issueId: 'demo-1',
      userId: 'gov-admin',
      userName: 'Eng. Roberto Alves',
      userEmail: 'obras@prefeitura.sp.gov.br',
      text: '🏛️ Resposta Oficial da Prefeitura: Chamado recebido e incluído no cronograma da Operação Tapa-Buracos com previsão de execução nesta semana.',
      createdAt: Date.now() - 1000 * 60 * 60 * 12,
      isOfficial: true,
      officialDepartment: 'Secretaria de Obras e Infraestrutura'
    }
  ],
  'demo-3': [
    {
      id: 'c3',
      issueId: 'demo-3',
      userId: 'gov-admin',
      userName: 'Defesa Civil Municipal',
      userEmail: 'defesacivil@prefeitura.sp.gov.br',
      text: '🏛️ Chamado atendido emergencialmente pela guarnição de plantão. Limpeza concluída.',
      createdAt: Date.now() - 1000 * 60 * 60 * 6,
      isOfficial: true,
      officialDepartment: 'Defesa Civil Municipal'
    }
  ]
};

export const commentService = {
  subscribeToComments: (issueId: string, callback: (comments: Comment[]) => void) => {
    try {
      const q = query(
        collection(db, getCommentsPath(issueId)), 
        orderBy('createdAt', 'asc')
      );
      
      return onSnapshot(q, (snapshot) => {
        if (snapshot.empty && DEMO_COMMENTS[issueId]) {
          callback(DEMO_COMMENTS[issueId]);
          return;
        }

        const comments = snapshot.docs.map(doc => ({
          ...doc.data(),
          id: doc.id,
          createdAt: doc.data().createdAt?.toMillis ? doc.data().createdAt.toMillis() : (typeof doc.data().createdAt === 'number' ? doc.data().createdAt : Date.now()),
        } as Comment));
        callback(comments);
      }, (error) => {
        console.warn('Fallback de comentários locais:', error);
        callback(DEMO_COMMENTS[issueId] || []);
      });
    } catch (e) {
      console.warn('Fallback direto para comentários demo:', e);
      callback(DEMO_COMMENTS[issueId] || []);
      return () => {};
    }
  },

  addComment: async (issueId: string, text: string, options?: { isOfficial?: boolean; departmentName?: string }) => {
    const user = auth.currentUser;
    const userId = user?.uid || 'guest-user';
    const userName = user?.displayName || (options?.isOfficial ? 'Gabinete Municipal' : 'Cidadão');
    const userEmail = user?.email || undefined;

    const commentData: Omit<Comment, 'id'> = {
      issueId,
      userId,
      userName,
      userEmail,
      text,
      createdAt: Date.now(),
      isOfficial: options?.isOfficial || false,
      officialDepartment: options?.departmentName
    };

    const docId = Math.random().toString(36).substr(2, 9);
    const path = `${getCommentsPath(issueId)}/${docId}`;
    
    try {
      await setDoc(doc(db, 'issues', issueId, 'comments', docId), { 
        ...commentData, 
        id: docId,
        createdAt: serverTimestamp() 
      });
      
      // Update issue comment count
      await updateDoc(doc(db, 'issues', issueId), {
        commentsCount: increment(1)
      });
      
      return docId;
    } catch (error) {
      console.warn('Fallback: adicionando comentário localmente:', error);
      if (!DEMO_COMMENTS[issueId]) DEMO_COMMENTS[issueId] = [];
      DEMO_COMMENTS[issueId].push({ ...commentData, id: docId });
      return docId;
    }
  }
};
