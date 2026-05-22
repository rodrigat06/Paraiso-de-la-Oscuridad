(function () {
  var input = document.getElementById("mibuscador");
  var cards = Array.prototype.slice.call(document.querySelectorAll(".significado-song-card"));
  var index = document.querySelector(".significados-indice");
  var hero = document.querySelector(".significados-indice-hero");

  if (!input || cards.length === 0 || !index) {
    return;
  }

  var searchBox = input.closest(".buscador");
  var searchButton = searchBox ? searchBox.querySelector("button") : null;
  var suggestions = document.createElement("div");
  var filterPanel = document.createElement("section");
  var activeIndex = -1;
  var selectedArtist = "";
  var selectedAlbum = "";
  var items = [];

  suggestions.className = "significados-sugerencias";
  suggestions.setAttribute("role", "listbox");
  filterPanel.className = "significados-filtros";

  if (searchBox) {
    searchBox.classList.add("buscador-significados");
    searchBox.appendChild(suggestions);
  }

  if (hero) {
    hero.insertAdjacentElement("afterend", filterPanel);
  } else {
    index.insertAdjacentElement("beforebegin", filterPanel);
  }

  function normalize(value) {
    return value
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/[^a-z0-9]+/g, " ")
      .trim();
  }

  function getCardTitle(card) {
    var title = card.querySelector("span");
    return title ? title.textContent.trim() : card.textContent.trim();
  }

  function getCardAlbum(card) {
    var album = card.closest(".significado-album-bloque");
    var title = album ? album.querySelector("h3") : null;
    return title ? title.textContent.trim() : "";
  }

  function getCardArtist(card) {
    var artist = card.closest(".significado-artista-bloque");
    var title = artist ? artist.querySelector("header h2") : null;
    return title ? title.textContent.trim() : "";
  }

  function getCurrentArtistName() {
    if (document.body.classList.contains("jazmin-seccion")) {
      return "Jazmin Bean";
    }

    return "";
  }

  function uniqueValues(values) {
    return values.filter(function (value, indexValue) {
      return value && values.indexOf(value) === indexValue;
    });
  }

  items = cards.map(function (card) {
    var song = getCardTitle(card);
    var album = getCardAlbum(card);
    var artist = getCardArtist(card);
    var article = card.closest(".significado-artista-bloque");
    var albumSection = card.closest(".significado-album-bloque");

    return {
      card: card,
      article: article,
      albumSection: albumSection,
      song: song,
      album: album,
      artist: artist,
      searchable: normalize(song + " " + album + " " + artist),
      normalizedSong: normalize(song)
    };
  });

  selectedArtist = getCurrentArtistName() || uniqueValues(items.map(function (item) {
    return item.artist;
  }))[0] || "";

  function getFirstAlbumForArtist(artist) {
    var albums = uniqueValues(items.filter(function (item) {
      return !artist || item.artist === artist;
    }).map(function (item) {
      return item.album;
    }));

    return albums[0] || "";
  }

  selectedAlbum = getFirstAlbumForArtist(selectedArtist);

  function matchesFilters(item) {
    var artistMatches = !selectedArtist || item.artist === selectedArtist;
    var albumMatches = !selectedAlbum || item.album === selectedAlbum;
    return artistMatches && albumMatches;
  }

  function sortItems(first, second) {
    var firstCurrent = first.artist === selectedArtist;
    var secondCurrent = second.artist === selectedArtist;

    if (firstCurrent !== secondCurrent) {
      return firstCurrent ? -1 : 1;
    }

    if (first.album !== second.album) {
      return first.album.localeCompare(second.album);
    }

    return first.song.localeCompare(second.song);
  }

  function createFilterButton(label, active, action) {
    var button = document.createElement("button");
    button.type = "button";
    button.className = active ? "significados-filtro is-active" : "significados-filtro";
    button.textContent = label;
    button.addEventListener("click", action);
    return button;
  }

  function renderFilters() {
    var artists = uniqueValues(items.map(function (item) {
      return item.artist;
    }));
    var albums = uniqueValues(items.filter(function (item) {
      return !selectedArtist || item.artist === selectedArtist;
    }).map(function (item) {
      return item.album;
    }));
    var visibleTotal = items.filter(matchesFilters).length;
    var artistGroup = document.createElement("div");
    var albumGroup = document.createElement("div");
    var total = document.createElement("p");

    filterPanel.innerHTML = "";
    artistGroup.className = "significados-filtro-grupo";
    albumGroup.className = "significados-filtro-grupo";
    total.className = "significados-total";
    total.textContent = visibleTotal + " canciones visibles";

    artistGroup.appendChild(createFilterButton("Todos los artistas", selectedArtist === "", function () {
      selectedArtist = "";
      selectedAlbum = "";
      updateView();
    }));

    artists.forEach(function (artist) {
      artistGroup.appendChild(createFilterButton(artist, selectedArtist === artist, function () {
        selectedArtist = artist;
        selectedAlbum = getFirstAlbumForArtist(artist);
        updateView();
      }));
    });

    albumGroup.appendChild(createFilterButton("Todos los albumes", selectedAlbum === "", function () {
      selectedAlbum = "";
      updateView();
    }));

    albums.forEach(function (album) {
      albumGroup.appendChild(createFilterButton(album, selectedAlbum === album, function () {
        selectedAlbum = album;
        updateView();
      }));
    });

    filterPanel.appendChild(artistGroup);
    filterPanel.appendChild(albumGroup);
    filterPanel.appendChild(total);
  }

  function updateView() {
    var articles = Array.prototype.slice.call(document.querySelectorAll(".significado-artista-bloque"));
    var albumSections = Array.prototype.slice.call(document.querySelectorAll(".significado-album-bloque"));

    albumSections.forEach(function (section) {
      var sectionItems = items.filter(function (item) {
        return item.albumSection === section;
      });
      var hasVisibleItems = sectionItems.some(matchesFilters);
      section.classList.toggle("is-hidden", !hasVisibleItems);
    });

    articles.forEach(function (article) {
      var articleItems = items.filter(function (item) {
        return item.article === article;
      });
      var hasVisibleItems = articleItems.some(matchesFilters);
      article.classList.toggle("is-hidden", !hasVisibleItems);
    });

    renderFilters();

    if (document.activeElement === input) {
      renderSuggestions(input.value);
    } else {
      hideSuggestions();
    }
  }

  function getMatches(query) {
    var normalizedQuery = normalize(query);
    var filteredItems = items.filter(matchesFilters);

    if (!normalizedQuery) {
      return filteredItems.sort(sortItems).slice(0, 8);
    }

    return filteredItems.filter(function (item) {
      return item.searchable.indexOf(normalizedQuery) !== -1;
    }).sort(function (first, second) {
      var firstExact = first.normalizedSong === normalizedQuery;
      var secondExact = second.normalizedSong === normalizedQuery;

      if (firstExact !== secondExact) {
        return firstExact ? -1 : 1;
      }

      return sortItems(first, second);
    }).slice(0, 8);
  }

  function hideSuggestions() {
    suggestions.classList.remove("is-visible");
    suggestions.innerHTML = "";
    activeIndex = -1;
  }

  function setActiveOption(indexOption) {
    var options = Array.prototype.slice.call(suggestions.querySelectorAll(".significados-sugerencia"));

    options.forEach(function (option) {
      option.classList.remove("is-active");
    });

    if (options[indexOption]) {
      options[indexOption].classList.add("is-active");
      options[indexOption].scrollIntoView({ block: "nearest" });
      activeIndex = indexOption;
    }
  }

  function openItem(item) {
    window.location.href = item.card.href;
  }

  function renderSuggestions(query) {
    var matches = getMatches(query);

    suggestions.innerHTML = "";
    activeIndex = -1;

    if (matches.length === 0) {
      var empty = document.createElement("p");
      empty.className = "significados-sugerencia-vacia";
      empty.textContent = "No se encontro esa cancion con esos filtros";
      suggestions.appendChild(empty);
      suggestions.classList.add("is-visible");
      return;
    }

    matches.forEach(function (item, indexItem) {
      var option = document.createElement("button");
      var song = document.createElement("span");
      var meta = document.createElement("small");

      option.type = "button";
      option.className = "significados-sugerencia";
      option.setAttribute("role", "option");
      option.dataset.index = String(indexItem);
      song.textContent = item.song;
      meta.textContent = item.album + " - " + item.artist;

      option.appendChild(song);
      option.appendChild(meta);
      option.addEventListener("mousedown", function (event) {
        event.preventDefault();
      });
      option.addEventListener("click", function () {
        openItem(item);
      });

      suggestions.appendChild(option);
    });

    suggestions.classList.add("is-visible");
  }

  function findResult(query) {
    return getMatches(query)[0];
  }

  function goToResult() {
    var query = input.value.trim();

    if (!query) {
      renderSuggestions("");
      input.focus();
      return;
    }

    var result = findResult(query);

    if (result) {
      openItem(result);
      return;
    }

    renderSuggestions(query);
    input.focus();
  }

  if (searchButton) {
    searchButton.addEventListener("click", goToResult);
  }

  input.addEventListener("focus", function () {
    renderSuggestions(input.value);
  });

  input.addEventListener("input", function () {
    renderSuggestions(input.value);
  });

  input.addEventListener("keydown", function (event) {
    var options = Array.prototype.slice.call(suggestions.querySelectorAll(".significados-sugerencia"));

    if (event.key === "ArrowDown" && options.length > 0) {
      event.preventDefault();
      setActiveOption(activeIndex < options.length - 1 ? activeIndex + 1 : 0);
      return;
    }

    if (event.key === "ArrowUp" && options.length > 0) {
      event.preventDefault();
      setActiveOption(activeIndex > 0 ? activeIndex - 1 : options.length - 1);
      return;
    }

    if (event.key === "Enter") {
      event.preventDefault();

      if (activeIndex >= 0 && options[activeIndex]) {
        options[activeIndex].click();
        return;
      }

      goToResult();
      return;
    }

    if (event.key === "Escape") {
      hideSuggestions();
    }
  });

  document.addEventListener("click", function (event) {
    if (searchBox && !searchBox.contains(event.target)) {
      hideSuggestions();
    }
  });

  updateView();
}());



