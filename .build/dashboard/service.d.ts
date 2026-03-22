import type { CreateNoteInput, CcRecipient, DriverRecipient, NoteLean, NoteResponse } from "./types";
export declare const getDashboardData: () => Promise<{
    message: string;
    time: string;
}>;
export type { CcRecipient, CreateNoteInput, DriverRecipient, NoteResponse };
export declare function toNoteResponse(doc: NoteLean): NoteResponse;
export declare const saveNote: (input: CreateNoteInput) => Promise<import("mongoose").Document<unknown, {}, {
    toDriverIds: any[];
    ccEmails: any[];
    title?: string | null | undefined;
    type?: string | null | undefined;
    description?: string | null | undefined;
    subject?: string | null | undefined;
    message?: string | null | undefined;
    gifUrl?: string | null | undefined;
} & import("mongoose").DefaultTimestampProps, {}, {}> & {
    toDriverIds: any[];
    ccEmails: any[];
    title?: string | null | undefined;
    type?: string | null | undefined;
    description?: string | null | undefined;
    subject?: string | null | undefined;
    message?: string | null | undefined;
    gifUrl?: string | null | undefined;
} & import("mongoose").DefaultTimestampProps & {
    _id: import("mongoose").Types.ObjectId;
} & {
    __v: number;
}>;
export declare const listNotes: () => Promise<(import("mongoose").FlattenMaps<{
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
    _id: import("mongoose").Types.ObjectId;
} & {
    __v: number;
})[]>;
//# sourceMappingURL=service.d.ts.map