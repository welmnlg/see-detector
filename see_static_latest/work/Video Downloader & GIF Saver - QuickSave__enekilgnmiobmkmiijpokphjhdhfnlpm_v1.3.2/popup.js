document.addEventListener('DOMContentLoaded', function() {
    const agreementModal = document.getElementById('agreement-modal');
    const mainPopup = document.getElementById('main-popup');
    const agreeButton = document.getElementById('agree-button');
    const downloadAllButton = document.getElementById('download-all');

    // Check if the user has agreed to the terms
    chrome.storage.local.get(['agreementAccepted'], function(result) {
        if (result.agreementAccepted) {
            showMainPopup();
        } else {
            showAgreementModal();
        }
    });

    function showAgreementModal() {
        agreementModal.style.display = 'flex';
        mainPopup.style.display = 'none';
    }

    function showMainPopup() {
        agreementModal.style.display = 'none';
        mainPopup.style.display = 'block';
    }

    // When the user clicks "I Agree"
    agreeButton.addEventListener('click', function() {
        chrome.storage.local.set({agreementAccepted: true}, function() {
            showMainPopup();
        });
    });

    // Handle "Download All" button click
        // Handle "Download All" button click
  
});
