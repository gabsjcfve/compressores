let currentData = {
    equipmentData: JSON.parse(localStorage.getItem('equipmentData')) || {}
};

// Atualizar data/hora
function updateDateTime() {
    const now = new Date();
    document.getElementById('datetime').textContent = now.toLocaleString('pt-BR', {
        day: '2-digit',
        month: 'long',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    });
}

// Gerenciar upload de foto
document.getElementById('photoInput').addEventListener('change', function(e) {
    const file = e.target.files[0];
    if (file && file.type.startsWith('image/')) {
        const reader = new FileReader();
        reader.onload = (event) => {
            const img = document.getElementById('photoPreview');
            img.src = event.target.result;
            img.style.display = 'block';
            const equipment = document.getElementById('equipment-select').value;
            currentData.equipmentData[equipment] = {
                ...currentData.equipmentData[equipment],
                photo: event.target.result
            };
            localStorage.setItem('equipmentData', JSON.stringify(currentData.equipmentData));
        };
        reader.readAsDataURL(file);
    }
});

// Salvar dados
function saveData() {
    const equipment = document.getElementById('equipment-select').value;
    currentData.equipmentData[equipment] = {
        responsible: document.getElementById('responsible').value,
        pressure: document.getElementById('pressure').value,
        temperature: document.getElementById('temperature').value,
        operation: document.getElementById('operation-select').value,
        datetime: document.getElementById('datetime').textContent,
        photo: currentData.equipmentData[equipment]?.photo || null
    };
    localStorage.setItem('equipmentData', JSON.stringify(currentData.equipmentData));
}

// Carregar dados
function loadData() {
    const equipment = document.getElementById('equipment-select').value;
    const data = currentData.equipmentData[equipment] || {};

    document.getElementById('responsible').value = data.responsible || '';
    document.getElementById('pressure').value = data.pressure || '';
    document.getElementById('temperature').value = data.temperature || '';
    document.getElementById('operation-select').value = data.operation || 'parado';

    const img = document.getElementById('photoPreview');
    if (data.photo) {
        img.src = data.photo;
        img.style.display = 'block';
    } else {
        img.style.display = 'none';
    }
}

// Gerar PDF
async function generatePDF() {
    try {
        const { jsPDF } = window.jspdf;
        const doc = new jsPDF({
            orientation: 'portrait',
            unit: 'mm',
            format: 'a4'
        });

        // Cabeçalho
        doc.setFontSize(16);
        doc.text("Relatório Técnico", 105, 20, { align: 'center' });
        doc.setFontSize(10);
        doc.text(`Gerado em: ${new Date().toLocaleString()}`, 105, 25, { align: 'center' });

        // Dados do equipamento
        let yPos = 40;
        const equipment = document.getElementById('equipment-select').value;
        const data = currentData.equipmentData[equipment] || {};

        doc.setFontSize(12);
        doc.setFont(undefined, 'bold');
        doc.text(`Equipamento: ${document.getElementById('equipment-select').selectedOptions[0].text}`, 20, yPos);
        doc.setFont(undefined, 'normal');

        doc.text(`Responsável: ${data.responsible}`, 20, yPos + 7);
        doc.text(`Pressão: ${data.pressure} bar`, 20, yPos + 14);
        doc.text(`Temperatura: ${data.temperature} °C`, 20, yPos + 21);
        doc.text(`Estado: ${data.operation}`, 20, yPos + 28);
        doc.text(`Data: ${data.datetime}`, 20, yPos + 35);
        yPos += 45;

        // Adicionar foto
        if (data.photo) {
            const img = new Image();
            img.src = data.photo;
            const canvas = await html2canvas(img, {
                scale: 2,
                useCORS: true,
                logging: false
            });

            const imgWidth = 150;
            const imgHeight = (canvas.height * imgWidth) / canvas.width;
            if (yPos + imgHeight > 270) {
                doc.addPage();
                yPos = 20;
            }
            doc.addImage(canvas, 'JPEG', 30, yPos, imgWidth, imgHeight);
        }

        // Salvar PDF
        doc.save(`relatorio_${Date.now()}.pdf`);
    } catch (error) {
        console.error('Erro ao gerar PDF:', error);
        alert('Erro ao gerar o PDF! Verifique o console para detalhes.');
    }
}

// Gerar Relatório Completo
async function generateCompletePDF() {
    try {
        const { jsPDF } = window.jspdf;
        const doc = new jsPDF({
            orientation: 'portrait',
            unit: 'mm',
            format: 'a4'
        });

        // Cabeçalho
        doc.setFontSize(16);
        doc.text("Relatório Técnico Completo", 105, 20, { align: 'center' });
        doc.setFontSize(10);
        doc.text(`Gerado em: ${new Date().toLocaleString()}`, 105, 25, { align: 'center' });

        // Dados dos equipamentos
        let yPos = 40;
        const equipmentData = currentData.equipmentData;

        for (const [equipment, data] of Object.entries(equipmentData)) {
            if (yPos > 250) {
                doc.addPage();
                yPos = 20;
            }

            doc.setFontSize(12);
            doc.setFont(undefined, 'bold');
            doc.text(`Equipamento: ${equipment}`, 20, yPos);
            doc.setFont(undefined, 'normal');

            doc.text(`Responsável: ${data.responsible}`, 20, yPos + 7);
            doc.text(`Pressão: ${data.pressure} bar`, 20, yPos + 14);
            doc.text(`Temperatura: ${data.temperature} °C`, 20, yPos + 21);
            doc.text(`Estado: ${data.operation}`, 20, yPos + 28);
            doc.text(`Data: ${data.datetime}`, 20, yPos + 35);
            yPos += 45;

            // Adicionar foto
            if (data.photo) {
                const img = new Image();
                img.src = data.photo;
                const canvas = await html2canvas(img, {
                    scale: 2,
                    useCORS: true,
                    logging: false
                });

                const imgWidth = 150;
                const imgHeight = (canvas.height * imgWidth) / canvas.width;
                if (yPos + imgHeight > 270) {
                    doc.addPage();
                    yPos = 20;
                }
                doc.addImage(canvas, 'JPEG', 30, yPos, imgWidth, imgHeight);
                yPos += imgHeight + 10;
            }
        }

        // Salvar PDF
        doc.save(`relatorio_completo_${Date.now()}.pdf`);
    } catch (error) {
        console.error('Erro ao gerar PDF:', error);
        alert('Erro ao gerar o PDF! Verifique o console para detalhes.');
    }
}

// Inicialização
document.addEventListener('DOMContentLoaded', () => {
    updateDateTime();
    setInterval(updateDateTime, 1000);

    document.getElementById('equipment-select').addEventListener('change', () => {
        saveData();
        loadData();
    });

    document.querySelectorAll('input, select').forEach(element => {
        element.addEventListener('input', () => {
            saveData();
            element.reportValidity();
        });
    });

    loadData();
});
