// BerryFlash App - Strawberry Shortcake themed!
$(document).ready(function() {
    // Stuff we need to remember
    var allSets = JSON.parse(localStorage.getItem('berryFlashSets')) || [];
    var currentSet = -1;
    var currentCard = 0;
    var cardFlipped = false;
    var editingMode = false;
    var setToEdit = -1;
    
    // Grab all the elements we need
    var studyPage = $('#study-page');
    var setsPage = $('#sets-page');
    var createPage = $('#create-page');
    var navButtons = $('.nav-button');
    var currentSetTitle = $('#current-set-title');
    var flashcard = $('#flashcard');
    var cardTerm = $('.card-term');
    var cardDefinition = $('.card-definition');
    var cardCounter = $('#card-counter');
    var progressFill = $('#progress-fill');
    var prevButton = $('#prev-btn');
    var nextButton = $('#next-btn');
    var flipButton = $('#flip-btn');
    var shuffleButton = $('#shuffle-btn');
    var resetButton = $('#reset-btn');
    var setsContainer = $('#sets-container');
    var createNewSetButton = $('#create-new-set');
    var backToSetsButton = $('#back-to-sets');
    var setForm = $('#set-form');
    var setNameInput = $('#set-name');
    var setDescriptionInput = $('#set-description');
    var cardsList = $('#cards-list');
    var addCardButton = $('#add-card');
    var cancelEditButton = $('#cancel-edit');
    var createTitle = $('#create-title');
    var confirmPopup = $('#confirm-popup');
    var confirmDeleteButton = $('#confirm-delete');
    var cancelDeleteButton = $('#cancel-delete');
    var feedbackRight = $('.feedback.right');
    var feedbackWrong = $('.feedback.wrong');
    
    // Start the app
    function startApp() {
        showSetsList();
        setupEvents();
        
        // If no sets, show empty message
        if (allSets.length === 0) {
            showEmptyMessage();
        }
    }
    
    // Show the list of sets
    function showSetsList() {
        setsContainer.empty();
        
        if (allSets.length === 0) {
            setsContainer.html(`
                <div class="empty-message">
                    <i class="fas fa-stroopwafel"></i>
                    <p>No flashcard sets yet. Make your first set to get started!</p>
                </div>
            `);
            return;
        }
        
        allSets.forEach(function(set, index) {
            var setItem = $(`
                <div class="set-item" data-index="${index}">
                    <div class="set-info">
                        <h3>${set.name}</h3>
                        <p>${set.description || 'No description'}</p>
                        <p><small>${set.cards.length} cards</small></p>
                    </div>
                    <div class="set-actions">
                        <button class="edit-btn" data-index="${index}">
                            <i class="fas fa-edit"></i>
                        </button>
                        <button class="delete-btn" data-index="${index}">
                            <i class="fas fa-trash"></i>
                        </button>
                    </div>
                </div>
            `);
            
            setsContainer.append(setItem);
        });
        
        // Make set items clickable
        $('.set-item').on('click', function(e) {
            if (!$(e.target).closest('.set-actions').length) {
                var index = $(this).data('index');
                chooseSet(index);
                showPage('study');
            }
        });
        
        $('.edit-btn').on('click', function() {
            var index = $(this).data('index');
            editThisSet(index);
        });
        
        $('.delete-btn').on('click', function(e) {
            e.stopPropagation();
            var index = $(this).data('index');
            askToDelete(index);
        });
    }
    
    // Show message when no set is picked
    function showEmptyMessage() {
        currentSetTitle.text('Pick a Set to Start Studying!');
        cardTerm.text('Choose a flashcard set to begin');
        cardDefinition.text('The answer will be here!');
        cardCounter.text('Card 0 of 0');
        progressFill.css('width', '0%');
        prevButton.prop('disabled', true);
        nextButton.prop('disabled', true);
        flipButton.prop('disabled', true);
        shuffleButton.prop('disabled', true);
        resetButton.prop('disabled', true);
    }
    
    // Pick a set to study
    function chooseSet(index) {
        currentSet = index;
        currentCard = 0;
        cardFlipped = false;
        
        var set = allSets[index];
        currentSetTitle.text(set.name);
        
        // Turn on buttons
        prevButton.prop('disabled', false);
        nextButton.prop('disabled', false);
        flipButton.prop('disabled', false);
        shuffleButton.prop('disabled', false);
        resetButton.prop('disabled', false);
        
        // Show the card
        updateCard();
    }
    
    // Update the card display
    function updateCard() {
        if (currentSet === -1 || allSets[currentSet].cards.length === 0) {
            cardTerm.text('This set has no cards');
            cardDefinition.text('Edit the set to add cards');
            cardCounter.text('Card 0 of 0');
            progressFill.css('width', '0%');
            return;
        }
        
        var set = allSets[currentSet];
        var card = set.cards[currentCard];
        
        cardTerm.text(card.term);
        cardDefinition.text(card.definition);
        
        // Update counter and progress bar
        cardCounter.text(`Card ${currentCard + 1} of ${set.cards.length}`);
        var progress = ((currentCard + 1) / set.cards.length) * 100;
        progressFill.css('width', `${progress}%`);
        
        // Make sure card is not flipped
        if (cardFlipped) {
            flashcard.removeClass('flipped');
            cardFlipped = false;
        }
        
        // Update navigation buttons
        prevButton.prop('disabled', currentCard === 0);
        nextButton.prop('disabled', currentCard === set.cards.length - 1);
    }
    
    // Flip the card over
    function flipTheCard() {
        flashcard.toggleClass('flipped');
        cardFlipped = !cardFlipped;
    }
    
    // Go to previous card
    function previousCard() {
        if (currentCard > 0) {
            currentCard--;
            updateCard();
        }
    }
    
    // Go to next card
    function nextCard() {
        var set = allSets[currentSet];
        if (currentCard < set.cards.length - 1) {
            currentCard++;
            updateCard();
        }
    }
    
    // Mix up the cards
    function shuffleCards() {
        if (currentSet === -1) return;
        
        var set = allSets[currentSet];
        // Mix them up good!
        for (var i = set.cards.length - 1; i > 0; i--) {
            var j = Math.floor(Math.random() * (i + 1));
            var temp = set.cards[i];
            set.cards[i] = set.cards[j];
            set.cards[j] = temp;
        }
        
        // Remember the new order
        localStorage.setItem('berryFlashSets', JSON.stringify(allSets));
        
        // Go back to first card
        currentCard = 0;
        updateCard();
        
        // Show a message
        showMessage('Cards all mixed up!');
    }
    
    // Put cards back in order
    function resetCards() {
        if (currentSet === -1) return;
        
        // Get the original order
        var originalSets = JSON.parse(localStorage.getItem('berryFlashSets')) || [];
        if (originalSets[currentSet]) {
            allSets[currentSet].cards = originalSets[currentSet].cards.slice();
            currentCard = 0;
            updateCard();
            
            // Show message
            showMessage('Back to the beginning!');
        }
    }
    
    // Show a little message
    function showMessage(msg, type) {
        // Just log it for now, could make it prettier later
        console.log(type + ': ' + msg);
    }
    
    // Show if answer was right or wrong
    function showAnswerFeedback(correct) {
        var feedback = correct ? feedbackRight : feedbackWrong;
        
        feedback.addClass('show');
        
        setTimeout(function() {
            feedback.removeClass('show');
        }, 1000);
    }
    
    // Show a page
    function showPage(pageName) {
        // Hide all pages
        studyPage.removeClass('active');
        setsPage.removeClass('active');
        createPage.removeClass('active');
        
        // Show the one we want
        $('#' + pageName + '-page').addClass('active');
        
        // Update nav buttons
        navButtons.removeClass('active');
        $('.nav-button[data-page="' + pageName + '"]').addClass('active');
    }
    
    // Start making a new set
    function createNewSet() {
        editingMode = false;
        setToEdit = -1;
        createTitle.text('Make a New Set');
        setForm[0].reset();
        cardsList.empty();
        
        // Start with one empty card
        addNewCard();
        
        showPage('create');
    }
    
    // Edit a set that already exists
    function editThisSet(index) {
        editingMode = true;
        setToEdit = index;
        
        var set = allSets[index];
        createTitle.text('Edit: ' + set.name);
        
        // Fill in the form
        setNameInput.val(set.name);
        setDescriptionInput.val(set.description || '');
        
        // Clear out old cards and add the ones from the set
        cardsList.empty();
        set.cards.forEach(function(card) {
            addNewCard(card.term, card.definition);
        });
        
        showPage('create');
    }
    
    // Add a new card to the form
    function addNewCard(term, definition) {
        term = term || '';
        definition = definition || '';
        
        var cardId = Date.now() + Math.random();
        var cardItem = $(`
            <div class="card-item" data-id="${cardId}">
                <div class="card-inputs">
                    <input type="text" class="card-term-input" placeholder="Term" value="${term}" required>
                    <input type="text" class="card-definition-input" placeholder="Definition" value="${definition}" required>
                </div>
                <button type="button" class="remove-card">
                    <i class="fas fa-times"></i>
                </button>
            </div>
        `);
        
        cardsList.append(cardItem);
        
        // Make the remove button work
        cardItem.find('.remove-card').on('click', function() {
            if (cardsList.children().length > 1) {
                cardItem.remove();
            } else {
                showMessage('You need at least one card!', 'warning');
            }
        });
    }
    
    // Save the set (new or edited)
    function saveSet(event) {
        event.preventDefault();
        
        // Check if name is there
        var setName = setNameInput.val().trim();
        if (!setName) {
            showMessage('You need to name your set!', 'error');
            return;
        }
        
        // Get all the cards
        var cards = [];
        var allGood = true;
        
        $('.card-item').each(function() {
            var term = $(this).find('.card-term-input').val().trim();
            var definition = $(this).find('.card-definition-input').val().trim();
            
            if (!term || !definition) {
                allGood = false;
                showMessage('All cards need both a term and definition!', 'error');
                return false; // Stop the loop
            }
            
            cards.push({ term: term, definition: definition });
        });
        
        if (!allGood) return;
        
        // Make the set object
        var setData = {
            name: setName,
            description: setDescriptionInput.val().trim(),
            cards: cards
        };
        
        // Save it
        if (editingMode) {
            allSets[setToEdit] = setData;
        } else {
            allSets.push(setData);
        }
        
        // Remember it
        localStorage.setItem('berryFlashSets', JSON.stringify(allSets));
        
        // Update the screen
        showSetsList();
        
        // If we edited the current set, update it
        if (editingMode && currentSet === setToEdit) {
            chooseSet(currentSet);
        }
        
        // Show message and go back to sets
        showMessage('Set "' + setName + '" ' + (editingMode ? 'updated' : 'created') + '!', 'success');
        showPage('sets');
    }
    
    // Ask if really want to delete
    function askToDelete(index) {
        confirmPopup.data('index', index).addClass('active');
    }
    
    // Actually delete the set
    function deleteSet(index) {
        allSets.splice(index, 1);
        localStorage.setItem('berryFlashSets', JSON.stringify(allSets));
        
        // Update screen
        showSetsList();
        
        // If we deleted the current set, show empty message
        if (currentSet === index) {
            currentSet = -1;
            showEmptyMessage();
        } else if (currentSet > index) {
            currentSet--;
        }
        
        confirmPopup.removeClass('active');
        showMessage('Set deleted!', 'success');
    }
    
    // Set up all the click and touch events
    function setupEvents() {
        // Navigation
        navButtons.on('click', function() {
            var page = $(this).data('page');
            showPage(page);
        });
        
        // Study page buttons
        prevButton.on('click', previousCard);
        nextButton.on('click', nextCard);
        flipButton.on('click', flipTheCard);
        shuffleButton.on('click', shuffleCards);
        resetButton.on('click', resetCards);
        
        // Click to flip card
        flashcard.on('click', flipTheCard);
        
        // Sets page buttons
        createNewSetButton.on('click', createNewSet);
        backToSetsButton.on('click', function() {
            showPage('sets');
        });
        
        // Create page buttons
        addCardButton.on('click', function() {
            addNewCard();
        });
        
        setForm.on('submit', saveSet);
        
        cancelEditButton.on('click', function() {
            if (editingMode) {
                showPage('sets');
            } else {
                showPage('study');
            }
        });
        
        // Popup buttons
        confirmDeleteButton.on('click', function() {
            var index = confirmPopup.data('index');
            deleteSet(index);
        });
        
        cancelDeleteButton.on('click', function() {
            confirmPopup.removeClass('active');
        });
        
        // Keyboard shortcuts
        $(document).on('keydown', function(e) {
            // Only work on study page
            if (!studyPage.hasClass('active')) return;
            
            if (e.key === 'ArrowLeft') {
                previousCard();
            } else if (e.key === 'ArrowRight') {
                nextCard();
            } else if (e.key === ' ' || e.key === 'Enter') {
                e.preventDefault();
                flipTheCard();
            }
        });
        
        // Swipe for mobile
        var touchStartX = 0;
        var touchEndX = 0;
        
        flashcard.on('touchstart', function(e) {
            touchStartX = e.changedTouches[0].screenX;
        });
        
        flashcard.on('touchend', function(e) {
            touchEndX = e.changedTouches[0].screenX;
            checkSwipe();
        });
        
        function checkSwipe() {
            var swipeMin = 50;
            var diff = touchEndX - touchStartX;
            
            if (Math.abs(diff) < swipeMin) return;
            
            if (diff > 0) {
                // Swiped right - got it right!
                showAnswerFeedback(true);
                setTimeout(nextCard, 500);
            } else {
                // Swiped left - need to study more
                showAnswerFeedback(false);
                setTimeout(nextCard, 500);
            }
        }
    }
    
    // Start the app!
    startApp();
});