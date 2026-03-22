import mongoose from "mongoose";
import type { CreateNotePayload } from "./types";
declare const noteSchema: mongoose.Schema<any, mongoose.Model<any, any, any, any, any, any>, {}, {}, {}, {}, {
    timestamps: true;
}, {
    toDriverIds: any[];
    ccEmails: any[];
    title?: string | null | undefined;
    type?: string | null | undefined;
    description?: string | null | undefined;
    subject?: string | null | undefined;
    message?: string | null | undefined;
    gifUrl?: string | null | undefined;
} & mongoose.DefaultTimestampProps, mongoose.Document<unknown, {}, mongoose.FlatRecord<{
    toDriverIds: any[];
    ccEmails: any[];
    title?: string | null | undefined;
    type?: string | null | undefined;
    description?: string | null | undefined;
    subject?: string | null | undefined;
    message?: string | null | undefined;
    gifUrl?: string | null | undefined;
} & mongoose.DefaultTimestampProps>, {}, mongoose.MergeType<mongoose.DefaultSchemaOptions, {
    timestamps: true;
}>> & mongoose.FlatRecord<{
    toDriverIds: any[];
    ccEmails: any[];
    title?: string | null | undefined;
    type?: string | null | undefined;
    description?: string | null | undefined;
    subject?: string | null | undefined;
    message?: string | null | undefined;
    gifUrl?: string | null | undefined;
} & mongoose.DefaultTimestampProps> & {
    _id: mongoose.Types.ObjectId;
} & {
    __v: number;
}>;
export type NoteDoc = mongoose.InferSchemaType<typeof noteSchema>;
export declare function insertNote(payload: CreateNotePayload): Promise<mongoose.Document<unknown, {}, {
    toDriverIds: any[];
    ccEmails: any[];
    title?: string | null | undefined;
    type?: string | null | undefined;
    description?: string | null | undefined;
    subject?: string | null | undefined;
    message?: string | null | undefined;
    gifUrl?: string | null | undefined;
} & mongoose.DefaultTimestampProps, {}, {}> & {
    toDriverIds: any[];
    ccEmails: any[];
    title?: string | null | undefined;
    type?: string | null | undefined;
    description?: string | null | undefined;
    subject?: string | null | undefined;
    message?: string | null | undefined;
    gifUrl?: string | null | undefined;
} & mongoose.DefaultTimestampProps & {
    _id: mongoose.Types.ObjectId;
} & {
    __v: number;
}>;
export declare function findAllNotesSorted(): Promise<(mongoose.FlattenMaps<{
    toDriverIds: any[];
    ccEmails: any[];
    title?: string | null | undefined;
    type?: string | null | undefined;
    description?: string | null | undefined;
    subject?: string | null | undefined;
    message?: string | null | undefined;
    gifUrl?: string | null | undefined;
    createdAt: NativeDate;
    updatedAt: NativeDate;
}> & {
    _id: mongoose.Types.ObjectId;
} & {
    __v: number;
})[]>;
export {};
//# sourceMappingURL=accessor.d.ts.map