<!-- ... existing code ... -->
    <script>
let chatInput, chatMessages, quickPrompts;

document.addEventListener("DOMContentLoaded", function () {
    chatInput = document.getElementById('chat-input');
    chatMessages = document.getElementById('chat-messages');
    quickPrompts = document.getElementById('quick-prompts');

    // 🔥 GANTI ATAU TAMBAHKAN EVENT LISTENER SUBMIT FORM INI 🔥
    const chatForm = document.getElementById('chat-form');
    if (chatForm) {
        chatForm.addEventListener('submit', async function(e) {
            e.preventDefault(); // Mencegah halaman reload
            
            const message = chatInput.value.trim();
            if (!message) return;

            // 1. Tampilkan Chat User di Layar
            const userMsgHTML = `
                <div class="flex justify-end mb-4">
                    <div class="bg-primary text-white rounded-2xl rounded-tr-sm px-4 py-2 max-w-[80%] shadow-sm">
                        <p class="text-sm">${message}</p>
                    </div>
                </div>
            `;
            chatMessages.insertAdjacentHTML('beforeend', userMsgHTML);
            chatInput.value = ''; // Kosongkan input
            
            // Sembunyikan quick prompts jika ada
            if (quickPrompts) quickPrompts.classList.add('hidden');

            // 2. Tampilkan Animasi "Berpikir..." di Layar
            // Buat ID unik agar nanti teks ini bisa diganti dengan jawaban AI
            const aiMsgId = 'ai-msg-' + Date.now(); 
            const aiMsgHTML = `
                <div class="flex justify-start mb-4">
                    <div class="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center mr-2 flex-shrink-0">
                        🤖
                    </div>
                    <div class="bg-white dark:bg-darkCard text-gray-800 dark:text-gray-200 rounded-2xl rounded-tl-sm px-4 py-2 max-w-[80%] shadow-sm border border-gray-100 dark:border-gray-800">
                        <div class="text-sm prose dark:prose-invert" id="${aiMsgId}">
                            <span class="animate-pulse">Berpikir...</span>
                        </div>
                    </div>
                </div>
            `;
            chatMessages.insertAdjacentHTML('beforeend', aiMsgHTML);
            chatMessages.scrollTop = chatMessages.scrollHeight; // Auto scroll ke bawah

            try {
                // 3. Tembak API ke Vercel
                const response = await fetch('/api/gemini', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ message: message })
                });

                const data = await response.json();
                console.log("Respon API:", data); // Cek di F12

                const aiTextElement = document.getElementById(aiMsgId);
                
                // 4. SINKRONISASI DATA 
                // Pastikan mengecek data.reply (karena di Vercel kita set { reply })
                if (response.ok && data.reply) {
                    aiTextElement.innerHTML = ''; // Hapus teks berpikir
                    
                    // Render menggunakan marked.js agar enter/bold/bullet rapi
                    if (typeof marked !== 'undefined') {
                        aiTextElement.innerHTML = marked.parse(data.reply);
                    } else {
                        // Fallback jika tidak ada marked.js, panggil fungsi ketikmu
                        typeText(aiTextElement, data.reply, 15);
                    }
                } else {
                    aiTextElement.innerHTML = `<span class="text-red-500">Maaf, terjadi kesalahan atau balasan kosong.</span>`;
                }
            } catch (error) {
                console.error("Error Fetch API:", error);
                document.getElementById(aiMsgId).innerHTML = `<span class="text-red-500">Koneksi API terputus. Pastikan link API benar.</span>`;
            }
            
            chatMessages.scrollTop = chatMessages.scrollHeight; // Auto scroll lagi
        });
    }
});

window.openChat = function () {
<!-- ... existing code ... -->
