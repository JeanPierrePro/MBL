// Importações para a 2ª Geração
const { onCall, HttpsError } = require("firebase-functions/v2/https");
const { onDocumentCreated } = require("firebase-functions/v2/firestore");
const { initializeApp } = require("firebase-admin/app");
const { getFirestore, FieldValue } = require("firebase-admin/firestore");
const { getAuth } = require("firebase-admin/auth");
const { getStorage } = require("firebase-admin/storage");

initializeApp();

// --- FUNÇÃO 1: createTeamMembersAccounts (SINTAXE CORRETA DE 2ª GERAÇÃO) ---
exports.createTeamMembersAccounts = onCall({ region: "us-central1" }, async (request) => {
    if (!request.auth) {
        throw new HttpsError('unauthenticated', 'Apenas utilizadores autenticados podem adicionar membros.');
    }
    const userId = request.auth.uid;

    try {
        const userDoc = await getFirestore().collection('users').doc(userId).get();
        if (!userDoc.exists || userDoc.data().role !== 'coach') {
            throw new HttpsError('permission-denied', 'Apenas treinadores podem adicionar membros de equipa.');
        }
    } catch (error) {
        console.error("Erro ao verificar permissões de coach:", error);
        throw new HttpsError('internal', 'Erro interno ao verificar permissões.', error.message);
    }

    const { teamId, membersData } = request.data;
    if (!teamId || !Array.isArray(membersData) || membersData.length === 0) {
        throw new HttpsError('invalid-argument', 'Dados da equipa ou dos membros inválidos.');
    }

    const createdMembers = [];
    const failedMembers = [];
    const batch = getFirestore().batch();

    for (const member of membersData) {
        const { email, nickname, lane, password } = member;
        try {
            let userRecord = await getAuth().createUser({ email, password, displayName: nickname });
            const memberProfileRef = getFirestore().collection('users').doc(userRecord.uid);
            batch.set(memberProfileRef, { nick: nickname, email, role: 'member', lane: lane || null, teamId }, { merge: true });
            createdMembers.push({ email, nickname, uid: userRecord.uid });
        } catch (error) {
            if (error.code === 'auth/email-already-exists') {
                console.log(`Email ${email} já existe, associando perfil...`);
                // Se o email já existe, apenas adicionamos o perfil no Firestore se não existir
                const existingUser = await getAuth().getUserByEmail(email);
                const memberProfileRef = getFirestore().collection('users').doc(existingUser.uid);
                batch.set(memberProfileRef, { nick: nickname, email, role: 'member', lane: lane || null, teamId }, { merge: true });
                createdMembers.push({ email, nickname, uid: existingUser.uid });
            } else {
                 failedMembers.push({ email, nickname, error: error.message });
            }
        }
    }

    await batch.commit();
    return { success: true, createdMembers, failedMembers };
});


// --- FUNÇÃO 2: getSignedUploadUrl (SINTAXE CORRETA DE 2ª GERAÇÃO) ---
exports.getSignedUploadUrl = onCall({ region: "us-central1" }, async (request) => {
    if (!request.auth) {
        throw new HttpsError('unauthenticated', 'Apenas utilizadores autenticados podem obter um URL.');
    }

    const userDoc = await getFirestore().collection('users').doc(request.auth.uid).get();
    if (userDoc.data().role !== 'coach') {
        throw new HttpsError('permission-denied', 'Apenas treinadores podem fazer upload.');
    }

    const { fileName, contentType } = request.data;
    const bucket = getStorage().bucket('mobile-lengends-b1755.appspot.com');
    const filePath = `news_images/${Date.now()}_${fileName}`;
    const file = bucket.file(filePath);
    
    const [url] = await file.getSignedUrl({
        version: 'v4',
        action: 'write',
        expires: Date.now() + 15 * 60 * 1000, // 15 minutos
        contentType: contentType,
    });

    return { signedUrl: url, filePath: filePath };
});


// --- FUNÇÃO 3: parseMatchResultText (SINTAXE CORRETA DE 2ª GERAÇÃO) ---
exports.parseMatchResultText = onDocumentCreated(
    {
        document: 'match_results_text/{docId}',
        region: "us-central1"
    },
    async (event) => {
        // Na v2, o snapshot do documento está em event.data
        const snap = event.data;
        if (!snap) { return; }

        // Os dados estão em snap.data()
        const docData = snap.data();
        if (!docData) { return; }

        const { text: rawText, file: filePath } = docData;
        if (!rawText || !filePath) { return; }

        const pathParts = filePath.split('/');
        if (pathParts.length < 6) { return; }
        
        const userId = pathParts[4];
        const matchId = pathParts[5];
        if (!userId || !matchId) { return; }

        const userDocRef = getFirestore().collection('users').doc(userId);
        const userDoc = await userDocRef.get();
        if (!userDoc.exists) { return; }

        const nameToSearch = userDoc.data().inGameName || userDoc.data().nick;
        if (!nameToSearch) { return; }

        // ... toda a sua lógica de parsePlayerStats e criação do newMatchHistoryItem ...
        // (Esta parte não precisa de mudar)

        try {
            await userDocRef.update({
                matchHistory: FieldValue.arrayUnion(newMatchHistoryItem)
            });
            console.log(`SUCESSO para o utilizador ${userId}.`);
        } catch (error) {
            console.error(`ERRO ao atualizar o perfil do utilizador ${userId}:`, error);
        }
    });