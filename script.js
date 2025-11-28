let autoRefreshInterval = null;

async function loadData() {
    try {
        const response = await fetch('/api/data');
        const data = await response.json();
        
        updateStats(data);
        renderTable(data);
    } catch (error) {
        console.error('Ошибка при загрузке данных:', error);
        document.getElementById('tableContainer').innerHTML = 
            '<div class="empty-state"><p>Ошибка при загрузке данных. Попробуйте обновить страницу.</p></div>';
    }
}

function updateStats(data) {
    document.getElementById('totalCount').textContent = data.length;
}

function renderTable(data) {
    const container = document.getElementById('tableContainer');
    
    if (data.length === 0) {
        container.innerHTML = `
            <div class="empty-state">
                <p>Нет полученных webhooks</p>
                <p style="margin-top: 10px; font-size: 0.9em;">Отправьте webhook на <code>/webhook</code> для начала</p>
            </div>
        `;
        return;
    }

    // Обратный порядок - последние сначала
    const reversedData = [...data].reverse();

    let html = `
        <table>
            <thead>
                <tr>
                    <th>#</th>
                    <th>Время получения</th>
                    <th>Данные JSON</th>
                </tr>
            </thead>
            <tbody>
    `;

    reversedData.forEach((item, index) => {
        const date = new Date(item.timestamp);
        const dateStr = date.toLocaleString('ru-RU', {
            year: 'numeric',
            month: '2-digit',
            day: '2-digit',
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit'
        });

        html += `
            <tr>
                <td>${data.length - index}</td>
                <td class="timestamp">${dateStr}</td>
                <td>
                    <div class="json-data">${JSON.stringify(item.data, null, 2)}</div>
                </td>
            </tr>
        `;
    });

    html += `
            </tbody>
        </table>
    `;

    container.innerHTML = html;
}

function toggleAutoRefresh() {
    const checkbox = document.getElementById('autoRefresh');
    
    if (checkbox.checked) {
        autoRefreshInterval = setInterval(loadData, 5000);
    } else {
        if (autoRefreshInterval) {
            clearInterval(autoRefreshInterval);
            autoRefreshInterval = null;
        }
    }
}

// Инициализация после загрузки DOM
document.addEventListener('DOMContentLoaded', () => {
    // Назначаем обработчики событий
    const refreshBtn = document.querySelector('.refresh-btn');
    if (refreshBtn) {
        refreshBtn.addEventListener('click', loadData);
    }

    const autoRefreshCheckbox = document.getElementById('autoRefresh');
    if (autoRefreshCheckbox) {
        autoRefreshCheckbox.addEventListener('change', toggleAutoRefresh);
    }

    // Загружаем данные при загрузке страницы
    loadData();
});

