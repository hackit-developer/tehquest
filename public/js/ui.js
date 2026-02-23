const AppUI = {
    alert(message, title = 'Attention') {
        return new Promise((resolve) => {
            const overlay = document.createElement('div');
            overlay.className = 'modal-overlay animate-fade';
            overlay.innerHTML = `
                <div class="modal card">
                    <h2 style="margin-bottom: 1rem;">${title}</h2>
                    <p style="margin-bottom: 2rem;">${message}</p>
                    <button class="btn btn-primary" id="modal-ok" style="width: 100%;">Got it</button>
                </div>
            `;
            document.body.appendChild(overlay);
            document.getElementById('modal-ok').focus();
            document.getElementById('modal-ok').onclick = () => {
                overlay.remove();
                resolve();
            };
        });
    },

    confirm(message, title = 'Confirm Action') {
        return new Promise((resolve) => {
            const overlay = document.createElement('div');
            overlay.className = 'modal-overlay animate-fade';
            overlay.innerHTML = `
                <div class="modal card">
                    <h2 style="margin-bottom: 1rem;">${title}</h2>
                    <p style="margin-bottom: 2rem;">${message}</p>
                    <div style="display: flex; gap: 1rem;">
                        <button class="btn btn-secondary" id="modal-cancel" style="flex: 1;">Cancel</button>
                        <button class="btn btn-primary" id="modal-confirm" style="flex: 1;">Confirm</button>
                    </div>
                </div>
            `;
            document.body.appendChild(overlay);
            document.getElementById('modal-confirm').onclick = () => {
                overlay.remove();
                resolve(true);
            };
            document.getElementById('modal-cancel').onclick = () => {
                overlay.remove();
                resolve(false);
            };
        });
    },

    notify(message, type = 'success') {
        const toast = document.createElement('div');
        toast.className = 'animate-fade';
        toast.style.cssText = `
            position: fixed;
            bottom: 24px;
            right: 24px;
            background: ${type === 'error' ? '#ef4444' : '#10b981'};
            color: white;
            padding: 1rem 1.5rem;
            border-radius: 12px;
            box-shadow: 0 10px 15px -3px rgba(0,0,0,0.1);
            font-weight: 600;
            z-index: 2000;
        `;
        toast.textContent = message;
        document.body.appendChild(toast);
        setTimeout(() => {
            toast.style.opacity = '0';
            toast.style.transform = 'translateY(10px)';
            toast.style.transition = 'all 0.3s ease';
            setTimeout(() => toast.remove(), 300);
        }, 3000);
    }
};

window.AppUI = AppUI;
