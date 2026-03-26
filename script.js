/* ============================================================
   E-GAME — script.js
   Navigation, Lessons, Quiz, PALPS game logic
   ============================================================ */

// ---- Mobile Nav Toggle ----
document.addEventListener('DOMContentLoaded', function() {
  var toggle = document.getElementById('navToggle');
  var links = document.getElementById('navLinks');
  if (toggle && links) {
    toggle.addEventListener('click', function() {
      links.classList.toggle('open');
    });
    // Close nav when a link is clicked
    links.querySelectorAll('a').forEach(function(a) {
      a.addEventListener('click', function() { links.classList.remove('open'); });
    });
  }

  // ---- Feedback Form ----
  var fbForm = document.getElementById('feedbackForm');
  if (fbForm) {
    fbForm.addEventListener('submit', function(e) {
      e.preventDefault();
      var name = document.getElementById('fbName').value.trim();
      var email = document.getElementById('fbEmail').value.trim();
      var type = document.getElementById('fbType').value;
      var message = document.getElementById('fbMessage').value.trim();

      var subject = 'E-GAME Feedback: ' + type + ' from ' + name;
      var body = 'Name: ' + name + '\n' +
        (email ? 'Email: ' + email + '\n' : '') +
        'Type: ' + type + '\n\n' +
        message;

      window.location.href = 'mailto:runarasimham@gmail.com?subject=' +
        encodeURIComponent(subject) + '&body=' + encodeURIComponent(body);
    });
  }
});

// ---- Utility: fetch JSON ----
function fetchJSON(url) {
  return fetch(url).then(function(r) { return r.json(); });
}

// ---- Utility: escape HTML ----
function esc(str) {
  var d = document.createElement('div');
  d.textContent = str;
  return d.innerHTML;
}

// ============================================================
// LESSONS PAGE
// ============================================================
function initLessonsPage() {
  fetchJSON('lessons.json').then(function(lessons) {
    var grid = document.getElementById('lessonGrid');
    var filterBar = document.getElementById('lessonFilters');
    var countEl = document.getElementById('lessonCount');
    var searchEl = document.getElementById('lessonSearch');
    var modal = document.getElementById('lessonModal');
    var modalBody = document.getElementById('modalBody');
    var modalClose = document.getElementById('modalClose');

    // Color map for categories
    var catColors = {
      'Sentences': '#0d7377',
      'Verbs': '#7c3aed',
      'Articles': '#0891b2',
      'Parts of Speech': '#059669',
      'Tenses': '#d97706',
      'Interrogatives': '#2563eb',
      'Punctuation': '#6366f1',
      'Advanced': '#475569'
    };

    // Build filter chips
    var categories = [];
    lessons.forEach(function(l) {
      if (categories.indexOf(l.category) === -1) categories.push(l.category);
    });

    var allChip = document.createElement('button');
    allChip.className = 'filter-chip active';
    allChip.textContent = 'All';
    allChip.dataset.cat = '';
    filterBar.appendChild(allChip);

    categories.forEach(function(c) {
      var chip = document.createElement('button');
      chip.className = 'filter-chip';
      chip.textContent = c;
      chip.dataset.cat = c;
      filterBar.appendChild(chip);
    });

    var activeFilter = '';

    filterBar.addEventListener('click', function(e) {
      if (!e.target.classList.contains('filter-chip')) return;
      filterBar.querySelectorAll('.filter-chip').forEach(function(c) { c.classList.remove('active'); });
      e.target.classList.add('active');
      activeFilter = e.target.dataset.cat;
      render();
    });

    searchEl.addEventListener('input', function() { render(); });

    function render() {
      var q = searchEl.value.toLowerCase();
      var filtered = lessons.filter(function(l) {
        var matchCat = !activeFilter || l.category === activeFilter;
        var matchQ = !q || l.title.toLowerCase().indexOf(q) !== -1 ||
          l.summary.toLowerCase().indexOf(q) !== -1 ||
          l.category.toLowerCase().indexOf(q) !== -1 ||
          l.topics.join(' ').toLowerCase().indexOf(q) !== -1;
        return matchCat && matchQ;
      });

      countEl.textContent = 'Showing ' + filtered.length + ' of ' + lessons.length + ' lessons';

      grid.innerHTML = '';
      filtered.forEach(function(l) {
        var color = catColors[l.category] || '#0d7377';
        var card = document.createElement('div');
        card.className = 'lesson-card';
        card.style.setProperty('--card-accent', color);
        card.innerHTML =
          '<span class="lesson-tag" style="background:' + color + '14;color:' + color + '">' + esc(l.category) +
          (l.step ? ' (Step ' + esc(l.step) + ')' : '') + '</span>' +
          '<h3>' + esc(l.title) + '</h3>' +
          '<p>' + esc(l.summary) + '</p>' +
          '<div class="lesson-topics">' + l.topics.map(function(t) {
            return '<span class="topic-tag">' + esc(t) + '</span>';
          }).join('') + '</div>';
        card.addEventListener('click', function() { openModal(l, color); });
        grid.appendChild(card);
      });
    }

    function openModal(l, color) {
      var c = l.content;
      var html = '<span class="modal-cat" style="color:' + color + '">' + esc(l.category) + '</span>';
      html += '<h2>' + esc(l.title) + '</h2>';
      html += '<p>' + esc(c.definition) + '</p>';

      if (c.grammar_family) {
        html += '<h3>📖 The Grammar Family Story</h3>';
        html += '<div class="example-box">' + esc(c.grammar_family) + '</div>';
      }

      if (c.kinds_of_sentences && c.kinds_of_sentences.length) {
        html += '<h3>Kinds of Sentences (5 Types)</h3>';
        c.kinds_of_sentences.forEach(function(k) {
          html += '<div class="example-box"><strong>' + esc(k.type) + ':</strong> ' + esc(k.description) +
            '<br><em>Ex: ' + esc(k.example) + '</em></div>';
        });
      }

      html += '<h3>Key Points</h3><ul>';
      c.key_points.forEach(function(p) {
        html += '<li>' + esc(p) + '</li>';
      });
      html += '</ul>';

      if (c.patterns && c.patterns.length) {
        html += '<h3>Examples & Patterns</h3>';
        c.patterns.forEach(function(p) {
          html += '<div class="example-box"><strong>' + esc(p.pattern) + ':</strong> ' + esc(p.example) +
            '<br><em>' + esc(p.explanation) + '</em></div>';
        });
      }

      modalBody.innerHTML = html;
      modal.classList.add('open');
      document.body.style.overflow = 'hidden';
    }

    function closeModal() {
      modal.classList.remove('open');
      document.body.style.overflow = '';
    }

    modalClose.addEventListener('click', closeModal);
    modal.addEventListener('click', function(e) {
      if (e.target === modal) closeModal();
    });
    document.addEventListener('keydown', function(e) {
      if (e.key === 'Escape') closeModal();
    });

    // Handle hash navigation from homepage
    var hash = window.location.hash.replace('#', '').toLowerCase();
    if (hash) {
      var matchCat = categories.find(function(c) {
        return c.toLowerCase().replace(/\s+/g, '-') === hash ||
               c.toLowerCase().indexOf(hash) !== -1;
      });
      if (matchCat) {
        activeFilter = matchCat;
        filterBar.querySelectorAll('.filter-chip').forEach(function(ch) {
          ch.classList.toggle('active', ch.dataset.cat === matchCat);
          if (ch.dataset.cat === '') ch.classList.remove('active');
        });
      }
    }

    render();
  });
}

// ============================================================
// QUIZ PAGE
// ============================================================
function initQuizPage() {
  fetchJSON('quiz.json').then(function(allQuestions) {
    var container = document.getElementById('quizContainer');
    var filterBar = document.getElementById('quizFilters');

    // Get categories
    var categories = [];
    allQuestions.forEach(function(q) {
      if (categories.indexOf(q.category) === -1) categories.push(q.category);
    });

    // Build filter chips
    var allChip = document.createElement('button');
    allChip.className = 'filter-chip active';
    allChip.textContent = 'All (' + allQuestions.length + ')';
    allChip.dataset.cat = '';
    filterBar.appendChild(allChip);

    categories.forEach(function(c) {
      var count = allQuestions.filter(function(q) { return q.category === c; }).length;
      var chip = document.createElement('button');
      chip.className = 'filter-chip';
      chip.textContent = c + ' (' + count + ')';
      chip.dataset.cat = c;
      filterBar.appendChild(chip);
    });

    var activeFilter = '';
    var questions = [];
    var current = 0;
    var score = 0;
    var answered = [];

    filterBar.addEventListener('click', function(e) {
      if (!e.target.classList.contains('filter-chip')) return;
      filterBar.querySelectorAll('.filter-chip').forEach(function(c) { c.classList.remove('active'); });
      e.target.classList.add('active');
      activeFilter = e.target.dataset.cat;
      startQuiz();
    });

    function startQuiz() {
      questions = activeFilter ? allQuestions.filter(function(q) { return q.category === activeFilter; }) : allQuestions.slice();
      // Shuffle
      for (var i = questions.length - 1; i > 0; i--) {
        var j = Math.floor(Math.random() * (i + 1));
        var tmp = questions[i]; questions[i] = questions[j]; questions[j] = tmp;
      }
      current = 0;
      score = 0;
      answered = [];
      renderQuestion();
    }

    function renderQuestion() {
      if (current >= questions.length) {
        showScore();
        return;
      }
      var q = questions[current];
      var markers = ['A', 'B', 'C', 'D'];

      var html = '<div class="quiz-progress"><div class="quiz-progress-bar"><div class="quiz-progress-fill" style="width:' +
        ((current / questions.length) * 100) + '%"></div></div>' +
        '<span class="quiz-progress-text">' + (current + 1) + ' / ' + questions.length + '</span></div>';

      html += '<div class="quiz-card"><span class="quiz-cat">' + esc(q.category) + '</span>';
      html += '<div class="quiz-question">' + esc(q.question) + '</div>';
      html += '<div class="quiz-options">';
      q.options.forEach(function(opt, i) {
        html += '<div class="quiz-option" data-idx="' + i + '">' +
          '<span class="opt-marker">' + markers[i] + '</span>' +
          '<span>' + esc(opt) + '</span></div>';
      });
      html += '</div>';
      html += '<div class="quiz-explanation" id="quizExpl">' + esc(q.explanation) + '</div>';
      html += '<div class="quiz-btn-row">' +
        '<button class="btn btn-primary" id="quizNext" style="display:none">Next →</button></div>';
      html += '</div>';

      container.innerHTML = html;

      // Bind option clicks
      container.querySelectorAll('.quiz-option').forEach(function(opt) {
        opt.addEventListener('click', function() {
          if (answered.indexOf(current) !== -1) return;
          answered.push(current);
          var idx = parseInt(opt.dataset.idx);
          var correct = q.answer;

          if (idx === correct) {
            opt.classList.add('correct');
            score++;
          } else {
            opt.classList.add('wrong');
            container.querySelectorAll('.quiz-option')[correct].classList.add('correct');
          }

          document.getElementById('quizExpl').classList.add('show');
          document.getElementById('quizNext').style.display = 'inline-block';
        });
      });

      // Bind next
      container.addEventListener('click', function(e) {
        if (e.target.id === 'quizNext') {
          current++;
          renderQuestion();
        }
      });
    }

    function showScore() {
      var pct = Math.round((score / questions.length) * 100);
      var msg = pct >= 80 ? '🏆 Excellent!' : pct >= 60 ? '👍 Good job!' : pct >= 40 ? '📖 Keep learning!' : '💪 Practice more!';

      container.innerHTML = '<div class="quiz-score">' +
        '<div class="score-num">' + score + '/' + questions.length + '</div>' +
        '<div class="score-label">' + pct + '% correct — ' + msg + '</div>' +
        '<div class="quiz-btn-row">' +
        '<button class="btn btn-primary" id="quizRetry">Try Again</button>' +
        '</div></div>';

      document.getElementById('quizRetry').addEventListener('click', startQuiz);
    }

    startQuiz();
  });
}

// ============================================================
// PALPS PAGE
// ============================================================
function initPalpsPage() {
  fetchJSON('palps.json').then(function(words) {
    var game = document.getElementById('palpsGame');
    var startBtn = document.getElementById('palpsStart');
    var resetBtn = document.getElementById('palpsReset');
    var scoreEl = document.getElementById('palpsScore');
    var totalEl = document.getElementById('palpsTotal');
    var streakEl = document.getElementById('palpsStreak');
    var remainEl = document.getElementById('palpsRemaining');

    var POS_LIST = ['Noun', 'Pronoun', 'Adjective', 'Verb', 'Adverb', 'Preposition', 'Conjunction', 'Interjection'];

    var pool = [];
    var current = null;
    var score = 0;
    var total = 0;
    var streak = 0;
    var hasAnswered = false;

    function shuffle(arr) {
      for (var i = arr.length - 1; i > 0; i--) {
        var j = Math.floor(Math.random() * (i + 1));
        var t = arr[i]; arr[i] = arr[j]; arr[j] = t;
      }
      return arr;
    }

    function updateStats() {
      scoreEl.textContent = score;
      totalEl.textContent = total;
      streakEl.textContent = streak;
      remainEl.textContent = pool.length;
    }

    function startGame() {
      pool = shuffle(words.slice());
      score = 0; total = 0; streak = 0;
      startBtn.style.display = 'none';
      resetBtn.style.display = 'inline-block';
      updateStats();
      nextWord();
    }

    function nextWord() {
      hasAnswered = false;
      if (pool.length === 0) {
        showFinal();
        return;
      }
      current = pool.pop();
      updateStats();

      var html = '<div class="word-card">' +
        '<div class="the-word">' + esc(current.word) + '</div>' +
        '<div class="word-hint">' + esc(current.hint) + '</div>' +
        '<div class="pos-options">';
      POS_LIST.forEach(function(p) {
        html += '<button class="pos-btn" data-pos="' + p + '">' + esc(p) + '</button>';
      });
      html += '</div>' +
        '<div class="quiz-explanation" id="palpsExpl"></div>' +
        '<div class="quiz-btn-row" style="margin-top:16px">' +
        '<button class="btn btn-primary" id="palpsNext" style="display:none">Next Word →</button></div>' +
        '</div>';

      game.innerHTML = html;

      // Bind POS buttons
      game.querySelectorAll('.pos-btn').forEach(function(btn) {
        btn.addEventListener('click', function() {
          if (hasAnswered) return;
          hasAnswered = true;
          total++;

          var chosen = btn.dataset.pos;
          var correct = current.pos;
          var allPos = [correct].concat(current.alt || []);

          if (chosen === correct) {
            btn.classList.add('correct');
            score++;
            streak++;
          } else {
            btn.classList.add('wrong');
            // Highlight correct
            game.querySelectorAll('.pos-btn').forEach(function(b) {
              if (b.dataset.pos === correct) b.classList.add('correct');
            });
            streak = 0;
          }

          // Show explanation
          var expl = '<strong>' + esc(current.word) + '</strong> — Primary: <strong>' + esc(correct) + '</strong>';
          if (current.alt && current.alt.length) {
            expl += ' | Also: ' + current.alt.map(function(a) { return '<strong>' + esc(a) + '</strong>'; }).join(', ');
            expl += ' <em>(Versonym!)</em>';
          }
          if (current.example_noun) expl += '<br>📝 ' + esc(current.example_noun);
          if (current.example_alt) expl += '<br>📝 ' + esc(current.example_alt);

          var explEl = document.getElementById('palpsExpl');
          explEl.innerHTML = expl;
          explEl.classList.add('show');

          document.getElementById('palpsNext').style.display = 'inline-block';
          updateStats();
        });
      });

      // Next button
      game.addEventListener('click', function handler(e) {
        if (e.target.id === 'palpsNext') {
          game.removeEventListener('click', handler);
          nextWord();
        }
      });
    }

    function showFinal() {
      var pct = Math.round((score / total) * 100);
      var msg = pct >= 80 ? '🏆 Word Analyst!' : pct >= 60 ? '👍 Great effort!' : '📖 Keep playing!';
      game.innerHTML = '<div class="quiz-score">' +
        '<div class="score-num">' + score + '/' + total + '</div>' +
        '<div class="score-label">' + pct + '% correct — ' + msg + '</div></div>';
    }

    startBtn.addEventListener('click', startGame);
    resetBtn.addEventListener('click', startGame);
  });
}

// ============================================================
// SLING PAGE — Sentence LINking Game
// ============================================================
function initSlingPage() {
  var chainDisplay = document.getElementById('slingChainDisplay');
  var prompt = document.getElementById('slingPrompt');
  var input = document.getElementById('slingInput');
  var submitBtn = document.getElementById('slingSubmit');
  var feedback = document.getElementById('slingFeedback');
  var startBtn = document.getElementById('slingStart');
  var resetBtn = document.getElementById('slingReset');
  var chainEl = document.getElementById('slingChain');
  var bestEl = document.getElementById('slingBest');

  var sentences = [];
  var requiredLetter = '';
  var best = 0;

  function getLastLetter(sentence) {
    var clean = sentence.replace(/[^a-zA-Z]/g, '');
    return clean.length ? clean[clean.length - 1].toUpperCase() : '';
  }

  function getLastWord(sentence) {
    var words = sentence.replace(/[^a-zA-Z\s]/g, '').trim().split(/\s+/);
    return words[words.length - 1] || '';
  }

  function renderChain() {
    chainDisplay.innerHTML = '';
    sentences.forEach(function(s, i) {
      var item = document.createElement('div');
      item.className = 'chain-item';
      var lastW = getLastWord(s);
      var lastL = getLastLetter(s);
      var text = s;
      // Highlight last letter
      if (lastW) {
        var idx = s.toLowerCase().lastIndexOf(lastW.toLowerCase());
        if (idx !== -1) {
          var before = s.substring(0, idx + lastW.length - 1);
          var letter = s[idx + lastW.length - 1];
          var after = s.substring(idx + lastW.length);
          text = esc(before) + '<strong class="chain-link">' + esc(letter) + '</strong>' + esc(after);
        } else {
          text = esc(s);
        }
      } else {
        text = esc(s);
      }
      // Highlight first letter
      if (i > 0) {
        text = '<strong class="chain-link">' + text[0] + '</strong>' + text.substring(1);
      }
      item.innerHTML = '<span class="chain-num">' + (i + 1) + '</span> <span class="chain-text">' + text + '</span>';
      chainDisplay.appendChild(item);

      if (i < sentences.length - 1) {
        var arrow = document.createElement('div');
        arrow.className = 'chain-arrow';
        arrow.innerHTML = '↓ starts with <strong>' + lastL + '</strong>';
        chainDisplay.appendChild(arrow);
      }
    });
    chainEl.textContent = sentences.length;
    if (sentences.length > best) {
      best = sentences.length;
      bestEl.textContent = best;
    }
  }

  function startGame() {
    sentences = [];
    requiredLetter = '';
    startBtn.style.display = 'none';
    resetBtn.style.display = 'inline-block';
    input.disabled = false;
    submitBtn.disabled = false;
    input.focus();
    prompt.textContent = 'Type any sentence to start your chain!';
    feedback.textContent = '';
    feedback.className = 'sling-feedback';
    chainDisplay.innerHTML = '';
    chainEl.textContent = '0';
  }

  function handleSubmit() {
    var val = input.value.trim();
    if (!val) return;

    // Must end with punctuation—add period if missing
    if (!/[.!?]$/.test(val)) val += '.';

    var firstLetter = val.replace(/[^a-zA-Z]/, '')[0];
    if (!firstLetter) {
      feedback.textContent = 'Please type a sentence with at least one word.';
      feedback.className = 'sling-feedback error';
      return;
    }

    if (requiredLetter && firstLetter.toUpperCase() !== requiredLetter) {
      feedback.textContent = 'Your sentence must start with the letter "' + requiredLetter + '". Try again!';
      feedback.className = 'sling-feedback error';
      return;
    }

    sentences.push(val);
    requiredLetter = getLastLetter(val);
    input.value = '';
    renderChain();
    prompt.textContent = 'Next sentence must start with the letter "' + requiredLetter + '"';
    feedback.textContent = '✓ Added! Chain length: ' + sentences.length;
    feedback.className = 'sling-feedback success';
    input.focus();
  }

  submitBtn.addEventListener('click', handleSubmit);
  input.addEventListener('keydown', function(e) {
    if (e.key === 'Enter') handleSubmit();
  });
  startBtn.addEventListener('click', startGame);
  resetBtn.addEventListener('click', startGame);
}

// ============================================================
// EITHER PAGE — End the sentence wITH the same lettER
// ============================================================
function initEitherPage() {
  var chainDisplay = document.getElementById('eitherChainDisplay');
  var prompt = document.getElementById('eitherPrompt');
  var input = document.getElementById('eitherInput');
  var submitBtn = document.getElementById('eitherSubmit');
  var feedback = document.getElementById('eitherFeedback');
  var startBtn = document.getElementById('eitherStart');
  var resetBtn = document.getElementById('eitherReset');
  var chainEl = document.getElementById('eitherChain');
  var matchEl = document.getElementById('eitherMatch');

  var sentences = [];
  var requiredLetter = '';
  var totalMatches = 0;

  function getPenultimateLetter(sentence) {
    var clean = sentence.replace(/[^a-zA-Z]/g, '');
    return clean.length >= 2 ? clean[clean.length - 2].toUpperCase() : '';
  }

  function countSameLetterWords(sentence) {
    var words = sentence.replace(/[^a-zA-Z\s]/g, '').trim().split(/\s+/);
    var count = 0;
    words.forEach(function(w) {
      if (w.length >= 2 && w[0].toUpperCase() === w[w.length - 1].toUpperCase()) count++;
    });
    return count;
  }

  function highlightSameLetterWords(sentence) {
    var words = sentence.split(/(\s+|[.,!?;:])/);
    return words.map(function(w) {
      var clean = w.replace(/[^a-zA-Z]/g, '');
      if (clean.length >= 2 && clean[0].toUpperCase() === clean[clean.length - 1].toUpperCase()) {
        return '<strong class="chain-link">' + esc(w) + '</strong>';
      }
      return esc(w);
    }).join('');
  }

  function renderChain() {
    chainDisplay.innerHTML = '';
    sentences.forEach(function(s, i) {
      var item = document.createElement('div');
      item.className = 'chain-item';
      item.innerHTML = '<span class="chain-num">' + (i + 1) + '</span> <span class="chain-text">' + highlightSameLetterWords(s) + '</span>';
      chainDisplay.appendChild(item);

      if (i < sentences.length - 1) {
        var penult = getPenultimateLetter(s);
        var arrow = document.createElement('div');
        arrow.className = 'chain-arrow';
        arrow.innerHTML = '↓ penultimate letter = <strong>' + penult + '</strong>';
        chainDisplay.appendChild(arrow);
      }
    });
    chainEl.textContent = sentences.length;
    matchEl.textContent = totalMatches;
  }

  function startGame() {
    sentences = [];
    requiredLetter = '';
    totalMatches = 0;
    startBtn.style.display = 'none';
    resetBtn.style.display = 'inline-block';
    input.disabled = false;
    submitBtn.disabled = false;
    input.focus();
    prompt.textContent = 'Type any sentence! Try to use words that start and end with the same letter.';
    feedback.textContent = '';
    feedback.className = 'sling-feedback';
    chainDisplay.innerHTML = '';
    chainEl.textContent = '0';
    matchEl.textContent = '0';
  }

  function handleSubmit() {
    var val = input.value.trim();
    if (!val) return;
    if (!/[.!?]$/.test(val)) val += '.';

    var firstLetter = val.replace(/[^a-zA-Z]/, '')[0];
    if (!firstLetter) return;

    if (requiredLetter && firstLetter.toUpperCase() !== requiredLetter) {
      feedback.textContent = 'Your sentence must start with "' + requiredLetter + '" (the penultimate letter of the previous sentence\'s last word).';
      feedback.className = 'sling-feedback error';
      return;
    }

    var matches = countSameLetterWords(val);
    totalMatches += matches;
    sentences.push(val);
    requiredLetter = getPenultimateLetter(val);
    input.value = '';
    renderChain();

    if (requiredLetter) {
      prompt.textContent = 'Next sentence must start with "' + requiredLetter + '" (penultimate letter).';
    } else {
      prompt.textContent = 'Type your next sentence!';
    }
    feedback.innerHTML = '✓ Added! ' + matches + ' same-letter word' + (matches !== 1 ? 's' : '') + ' found.';
    feedback.className = 'sling-feedback success';
    input.focus();
  }

  submitBtn.addEventListener('click', handleSubmit);
  input.addEventListener('keydown', function(e) {
    if (e.key === 'Enter') handleSubmit();
  });
  startBtn.addEventListener('click', startGame);
  resetBtn.addEventListener('click', startGame);
}

// ============================================================
// SPELL SPREAD PAGE
// ============================================================
function initSpellSpreadPage() {
  var gameArea = document.getElementById('spellGameArea');
  var startBtn = document.getElementById('spellStart');
  var skipBtn = document.getElementById('spellSkip');
  var resetBtn = document.getElementById('spellReset');
  var scoreEl = document.getElementById('spellScore');
  var totalEl = document.getElementById('spellTotal');

  var WORDS = [
    { word: 'TREE', hint: 'A tall plant with trunk and branches' },
    { word: 'FISH', hint: 'An aquatic animal' },
    { word: 'FOOD', hint: 'What we eat for nourishment' },
    { word: 'DOCTOR', hint: 'A medical professional' },
    { word: 'FRIEND', hint: 'Someone you trust and care about' },
    { word: 'BARBER', hint: 'One who cuts hair' },
    { word: 'LAWYER', hint: 'A legal professional' },
    { word: 'TIME', hint: 'The continuous progression of events' },
    { word: 'LOVE', hint: 'A deep feeling of affection' },
    { word: 'BOOK', hint: 'A written or printed work' },
    { word: 'RAIN', hint: 'Water falling from clouds' },
    { word: 'STAR', hint: 'A luminous point in the night sky' },
    { word: 'HOME', hint: 'A place where one lives' },
    { word: 'LIFE', hint: 'The existence of a living being' },
    { word: 'HOPE', hint: 'An optimistic feeling about the future' },
    { word: 'NINE', hint: 'A number after eight' },
    { word: 'CORONA', hint: 'A virus that caused a pandemic' },
    { word: 'ENGLISH', hint: 'A global language' },
    { word: 'MUSIC', hint: 'Art of combining sounds harmoniously' },
    { word: 'WATER', hint: 'A clear liquid essential for life' }
  ];

  var pool = [];
  var current = null;
  var score = 0;
  var attempted = 0;

  function shuffle(arr) {
    for (var i = arr.length - 1; i > 0; i--) {
      var j = Math.floor(Math.random() * (i + 1));
      var t = arr[i]; arr[i] = arr[j]; arr[j] = t;
    }
    return arr;
  }

  function startGame() {
    pool = shuffle(WORDS.slice());
    score = 0;
    attempted = 0;
    scoreEl.textContent = '0';
    totalEl.textContent = '0';
    startBtn.style.display = 'none';
    skipBtn.style.display = 'inline-block';
    resetBtn.style.display = 'inline-block';
    nextWord();
  }

  function nextWord() {
    if (pool.length === 0) {
      showFinal();
      return;
    }
    current = pool.pop();
    renderWord();
  }

  function renderWord() {
    var letters = current.word.split('');
    var html = '<div class="spell-target">';
    html += '<div class="spell-target-word">' + esc(current.word) + '</div>';
    html += '<div class="spell-target-hint">' + esc(current.hint) + '</div>';
    html += '</div>';
    html += '<div class="spell-inputs" id="spellInputs">';
    letters.forEach(function(l, i) {
      html += '<div class="spell-input-row" data-letter="' + l.toUpperCase() + '">';
      html += '<span class="spell-letter-indicator">' + l.toUpperCase() + '</span>';
      html += '<input type="text" placeholder="Word starting with ' + l.toUpperCase() + '..." data-idx="' + i + '">';
      html += '</div>';
    });
    html += '</div>';
    html += '<div class="quiz-btn-row" style="margin-top:16px">';
    html += '<button class="btn btn-primary" id="spellCheck">Check ✓</button>';
    html += '</div>';
    html += '<div class="sling-feedback" id="spellFeedback"></div>';

    gameArea.innerHTML = html;

    // Focus first input
    var firstInput = gameArea.querySelector('input[data-idx="0"]');
    if (firstInput) firstInput.focus();

    // Auto-advance to next input
    var inputs = gameArea.querySelectorAll('input');
    inputs.forEach(function(inp, i) {
      inp.addEventListener('keydown', function(e) {
        if (e.key === 'Enter') {
          if (i < inputs.length - 1) {
            inputs[i + 1].focus();
          } else {
            checkAnswer();
          }
        }
      });
    });

    document.getElementById('spellCheck').addEventListener('click', checkAnswer);
  }

  function checkAnswer() {
    var rows = gameArea.querySelectorAll('.spell-input-row');
    var allValid = true;
    rows.forEach(function(row) {
      var letter = row.dataset.letter;
      var input = row.querySelector('input');
      var word = input.value.trim();
      if (word && word[0].toUpperCase() === letter) {
        row.className = 'spell-input-row valid';
      } else {
        row.className = 'spell-input-row invalid';
        allValid = false;
      }
    });

    attempted++;
    totalEl.textContent = attempted;

    var fb = document.getElementById('spellFeedback');
    if (allValid) {
      score++;
      scoreEl.textContent = score;
      fb.textContent = '✓ Excellent! Your SPELL SPREAD for "' + current.word + '" is valid!';
      fb.className = 'sling-feedback success';
      setTimeout(nextWord, 1500);
    } else {
      fb.textContent = 'Some words don\'t match their required starting letter. Fix the highlighted ones and try again.';
      fb.className = 'sling-feedback error';
    }
  }

  function showFinal() {
    var pct = attempted > 0 ? Math.round((score / attempted) * 100) : 0;
    var msg = pct >= 80 ? '🏆 Word Architect!' : pct >= 60 ? '👍 Great creativity!' : '📖 Keep practicing!';
    gameArea.innerHTML = '<div class="quiz-score">' +
      '<div class="score-num">' + score + '/' + attempted + '</div>' +
      '<div class="score-label">' + pct + '% completed — ' + msg + '</div></div>';
    skipBtn.style.display = 'none';
  }

  skipBtn.addEventListener('click', function() {
    attempted++;
    totalEl.textContent = attempted;
    nextWord();
  });
  startBtn.addEventListener('click', startGame);
  resetBtn.addEventListener('click', startGame);
}
