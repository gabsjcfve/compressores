document.addEventListener('DOMContentLoaded', function () {
    displayDateTime();
    setupPhotoUploads();
});

function displayDateTime() {
    const datetimeElement = document.getElementById('datetime');
    const now = new Date();
    const formattedDate = now.toLocaleDateString('pt-BR', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    });
    const formattedTime = now.toLocaleTimeString('pt-BR', {
        hour: '2-digit',
        minute: '2-digit'
    });
    datetimeElement.textContent = `${formattedDate} - ${formattedTime}`;
}

function setupPhotoUploads() {
    const photoInputs = document.querySelectorAll('input[type="file"]');
    photoInputs.forEach(input => {
        input.addEventListener('change', function (event) {
            const file = event.target.files[0];
            if (file) {
                const reader = new FileReader();
                reader.onload = function (e) {
                    const photoPreview = document.getElementById(`photoPreview-${input.id.split('-')[1]}`);
                    photoPreview.src = e.target.result;
                    photoPreview.classList.remove('hidden');
                };
                reader.readAsDataURL(file);
            }
        });
    });
}

function generateCompletePDF() {
    const { jsPDF } = window.jspdf;
    const doc = new jsPDF();

    const responsible = document.getElementById('responsible').value;
    const equipmentItems = document.querySelectorAll('.equipment-item');

    doc.text('Relatório Técnico', 10, 10);
    doc.text(`Responsável: ${responsible}`, 10, 20);

    let yOffset = 30;

    equipmentItems.forEach(item => {
        const equipmentName = item.getAttribute('data-equipment');
        const pressure = item.querySelector(`input[id^="pressure-"]`).value;
        const temperature = item.querySelector(`input[id^="temperature-"]`).value;
        const operation = item.querySelector(`select[id^="operation-"]`).value;
        const photoPreview = item.querySelector(`img[id^="photoPreview-"]`);

        doc.text(`Equipamento: ${equipmentName}`, 10, yOffset);
        doc.text(`Pressão: ${pressure} bar`, 10, yOffset + 10);
        doc.text(`Temperatura: ${temperature} °C`, 10, yOffset + 20);
        doc.text(`Estado: ${operation}`, 10, yOffset + 30);

        if (photoPreview.src) {
            const imgData = photoPreview.src;
            doc.addImage(imgData, 'JPEG', 10, yOffset + 40, 50, 50);
            yOffset += 90;
        } else {
            yOffset += 70;
        }

        if (yOffset > 250) {
            doc.addPage();
            yOffset = 10;
        }
    });

    doc.save('relatorio_completo.pdf');
}

