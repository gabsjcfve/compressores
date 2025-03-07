// Armazenamento de dados
let equipmentData = JSON.parse(localStorage.getItem('equipmentData')) || {};

// Atualização automática de data/hora
function updateDateTime() {
    const options = { 
        weekday: 'long', 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit'
    };
    document.getElementById('datetime').textContent = 
        new Date().toLocaleDateString('pt-BR', options);
}

// Gerenciamento de fotos
document.getElementById('photoInput').addEventListener('change', function(e) {
    const file = e.target.files[0];
    if (file && file.type.startsWith('image/')) {
        const reader = new FileReader();
        reader.onload = (event) => {
            const img = document.getElementById('photoDisplay');
            img.src = event.target.result;
            img.style.display = 'block';
        };
        reader.readAsDataURL(file);
    }
});

// Salvar dados do equipamento
function saveEquipmentData() {
    const equipment = document.getElementById('equipment-select').value;
    const data = {
        responsible: document.getElementById('responsible').value,
        pressure: document.getElementById('pressure').value,
        temperature: document.getElementById('temperature').value,
        operation: document.getElementById('operation-select').value,
        datetime: document.getElementById('datetime').textContent
    };
    
    equipmentData[equipment] = data;
    localStorage.setItem('equipmentData', JSON.stringify(equipmentData));
}

// Carregar dados do equipamento
function loadEquipmentData() {
    const equipment = document.getElementById('equipment-select').value;
    const data = equipmentData[equipment] || {};
    
    document.getElementById('responsible').value = data.responsible || '';
    document.getElementById('pressure').value = data.pressure || '';
    document.getElementById('temperature').value = data.temperature || '';
    document.getElementById('operation-select').value = data.operation || 'parado';
}

// Gerar PDF profissional
async function generatePDF() {
    const { jsPDF } = window.jspdf;
    const doc = new jsPDF({
        orientation: 'p',
        unit: 'mm',
        format: 'a4'
    });

    // Adicionar logo
    const logoImg = new Image();
    logoImg.src = 'https://bucket-site-steck.s3.sa-east-1.amazonaws.com/images/shared.jpg';
    
    await new Promise((resolve) => {
        logoImg.onload = resolve;
        logoImg.onerror = resolve; // Prevenir travamento se a imagem não carregar
    });

    doc.addImage(logoImg, 'JPEG', 15, 10, 40, 15);

    // Configurações do documento
    doc.setFont('helvetica');
    doc.setFontSize(12);
    doc.setTextColor(40, 40, 40);
    
    let yPos = 40;

    // Adicionar dados de todos os equipamentos
    Object.entries(equipmentData).forEach(([equipment, data]) => {
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
        
        if(yPos > 250) {
            doc.addPage();
            yPos = 20;
        }
    });

    // Adicionar foto
    const imgElement = document.getElementById('photoDisplay');
    if (imgElement.src) {
        const canvas = await html2canvas(imgElement, {
            scale: 3,
            useCORS: true,
            logging: false
        });
        
        const imgWidth = 150;
        const imgHeight = (canvas.height * imgWidth) / canvas.width;
        doc.addPage();
        doc.addImage(canvas, 'JPEG', 30, 20, imgWidth, imgHeight);
    }

    // Rodapé
    const totalPages = doc.internal.getNumberOfPages();
    for(let i = 1; i <= totalPages; i++) {
        doc.setPage(i);
        doc.setFillColor(211, 47, 47);
        doc.rect(0, 280, 210, 20, 'F');
        doc.setTextColor(255, 255, 255);
        doc.setFontSize(10);
        doc.text(`Página ${i} de ${totalPages} - Gerado em ${new Date().toLocaleString()}`, 
                105, 287, { align: 'center' });
    }

    doc.save(`Relatorio_Steck_${Date.now()}.pdf`);
}

// Event Listeners
document.addEventListener('DOMContentLoaded', () => {
    updateDateTime();
    setInterval(updateDateTime, 1000);
    loadEquipmentData();
});

document.querySelectorAll('input, select').forEach(element => {
    element.addEventListener('input', () => {
        element.reportValidity();
    });
});
