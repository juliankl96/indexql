export function getBuckets(database: string): Promise<string[]> {
    let idbOpenDBRequest = indexedDB.open(database);

    return new Promise<string[]>((resolve, reject) => {
        idbOpenDBRequest.onsuccess = (event) => {
            let db = event.target['result'];
            let tables = [];
            for (let i = 0; i < db.objectStoreNames.length; i++) {
                tables.push(db.objectStoreNames.item(i));
            }
            db.close();
            resolve(tables);
        }

        idbOpenDBRequest.onerror = (event) => {
            reject(event);
        }
    })
}
