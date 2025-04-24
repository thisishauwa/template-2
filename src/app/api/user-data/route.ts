import { NextRequest, NextResponse } from 'next/server';
import { safeGetUserCollection } from '../../../lib/firebase/serverUtils';
import { app } from '../../../lib/firebase/firebase';

export async function GET(request: NextRequest) {
  // Check if Firebase is properly initialized
  if (!app) {
    return NextResponse.json(
      { 
        error: 'Firebase is not properly configured. Please check your environment variables.',
        data: []
      }, 
      { status: 503 }
    );
  }

  // Check for valid auth in the request
  const authHeader = request.headers.get('authorization');
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return NextResponse.json({ error: 'Unauthorized', data: [] }, { status: 401 });
  }

  // Get the requested data type
  const searchParams = request.nextUrl.searchParams;
  const dataType = searchParams.get('type');

  if (!dataType || (dataType !== 'watchlist' && dataType !== 'moodEntries')) {
    return NextResponse.json(
      { error: 'Invalid data type. Use "watchlist" or "moodEntries"', data: [] },
      { status: 400 }
    );
  }

  try {
    // Fetch the appropriate collection based on dataType
    const collectionName = dataType === 'watchlist' ? 'watchlist' : 'moodEntries';
    const data = await safeGetUserCollection(collectionName);

    return NextResponse.json({ data });
  } catch (error) {
    console.error('Error fetching user data:', error);
    return NextResponse.json(
      { error: 'Failed to fetch user data', data: [] },
      { status: 500 }
    );
  }
} 