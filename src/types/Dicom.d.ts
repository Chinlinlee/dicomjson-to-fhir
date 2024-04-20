

export type DicomJsonItem = {
    vr: string;
    Value: string[];
}

export type DicomJson = {
    [key: string]: DicomJsonItem;
}