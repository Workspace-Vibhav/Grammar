import { NextResponse } from "next/server";
import User from "@/app/db/schema";
import dbConnect from "@/lib/mongodb";

interface RequestBodyType {
  _id: string 
  documentId: string
}

export async function POST(req: Request) {
    try {
        const { _id, documentId }: RequestBodyType = await req.json();
        await dbConnect();

        const user = await User.findOne(
            { '_id': _id, 'documents._id': documentId }, 
            { 'documents.$': 1 }
        );
        
        if (!user) {
            return NextResponse.json({ error: 'Document not found' }, { status: 404 });
        }

        await User.findOneAndUpdate(
            { _id },
            { $pull: { documents: { _id: documentId } } }
        );

        await User.findOneAndUpdate(
            { _id },
            { 
                $push: { 
                    trashs: {
                        _id: user.documents[0]._id,
                        title: user.documents[0].title,
                        text: user.documents[0].text,
                        status: user.documents[0].status,
                        language: user.documents[0].language,
                    }
                } 
            }
        );

        return NextResponse.json({ status: 'deleted' });
    } catch (error) {
        console.error('Delete document error:', error);
        return NextResponse.json({ error: 'Failed to delete document' }, { status: 500 });
    }
}