// src/app/api/client/projects/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/firebase';
import { collection, getDocs, addDoc, query, where, orderBy, Timestamp } from 'firebase/firestore';
import { requireClientAuth, errorResponse } from '@/lib/api/middleware';
import type { Project } from '@/lib/types/firestore';
import { logError } from '@/lib/log';

export async function GET(request: NextRequest) {
  try {
    const authResult = await requireClientAuth(request);
    if (authResult instanceof Response) return authResult;
    
    const { tenantId, userId } = authResult;
    const { searchParams } = request.nextUrl;
    const status = searchParams.get('status');

    // Query projects for the user's tenant and user
    let q = query(
      collection(db, 'projects'),
      where('tenantId', '==', tenantId),
      where('userId', '==', userId),
      orderBy('createdAt', 'desc')
    );

    if (status && status !== 'all') {
      q = query(
        collection(db, 'projects'),
        where('tenantId', '==', tenantId),
        where('userId', '==', userId),
        where('status', '==', status),
        orderBy('createdAt', 'desc')
      );
    }

    const snap = await getDocs(q);

    const projects = snap.docs.map((doc) => {
      const data = doc.data() as Omit<Project, 'id'>;
      return {
        id: doc.id,
        ...data,
        createdAt: data.createdAt.toDate().toISOString(),
        updatedAt: data.updatedAt.toDate().toISOString(),
      };
    });

    return NextResponse.json(projects);
  } catch (error) {
    logError('api/client/projects GET', error, {
      url: request.url,
      method: 'GET',
    });
    return errorResponse('INTERNAL_ERROR', 500, 'Failed to fetch projects');
  }
}

export async function POST(request: NextRequest) {
  try {
    const authResult = await requireClientAuth(request);
    if (authResult instanceof Response) return authResult;
    
    const { userId, tenantId } = authResult;
    const body = await request.json();

    // Validate required fields
    if (!body.name || !body.type) {
      return errorResponse('BAD_REQUEST', 400, 'name and type are required');
    }

    const projectData: Omit<Project, 'id'> = {
      tenantId,
      userId,
      name: body.name,
      description: body.description || '',
      type: body.type,
      status: body.status || 'active',
      createdAt: Timestamp.now(),
      updatedAt: Timestamp.now(),
    };

    const docRef = await addDoc(collection(db, 'projects'), projectData);

    return NextResponse.json({ 
      projectId: docRef.id,
      ...projectData,
      createdAt: projectData.createdAt.toDate().toISOString(),
      updatedAt: projectData.updatedAt.toDate().toISOString(),
    }, { status: 201 });
  } catch (error) {
    logError('api/client/projects POST', error, {
      url: request.url,
      method: 'POST',
    });
    return errorResponse('INTERNAL_ERROR', 500, 'Failed to create project');
  }
}
