"use strict";
const apiURL = "http://api.tvmaze.com/";
const missingIMG = "https://imgur.com/gallery/sad-cat-edit-UVd9rvl#/t/sad_cat";
const $showsList = $("#showsList");
const $episodesArea = $("#episodesArea");
const $searchForm = $("#searchForm");
const $episodesList = $("#episodesList");



async function getShowsByTerm(term) 
  {
    const response = await axios({
      baseURL: apiURL,
      url: "search/shows",
      method: "GET",
      params:{
        q: term,
      },
    });

    return response.data.map(function(result){
      const show = result.show;
      return {
        id: show.id,
        name: show.name,
        summary: show.summary,
        image: show.image ? show.image.medium : missingIMG,
      };
    });
  }


/** Given list of shows, create markup for each and to DOM */

function populateShows(shows) {
  $showsList.empty();

  for (let show of shows) {
    const $show = $(
      `<div data-show-id="${show.id}" class="Show col-md-12 col-lg-6 mb-4">
         <div class="media">
           <img
              src="${show.image}" alt="${show.name}"
              class="w-25 me-3">
           <div class="media-body">
             <h5 class="text-primary">${show.name}</h5>
             <div><small>${show.summary}</small></div>
             <button class="btn btn-outline-light btn-sm Show-getEpisodes">
               Episodes
             </button>
           </div>
         </div>
       </div>
      `);

    $showsList.append($show);
  }
}


/** Handle search form submission: get shows from API and display.
 *    Hide episodes area (that only gets shown if they ask for episodes)
 */

async function searchForShowAndDisplay() {
  const term = $("#searchForm-term").val();
  const shows = await getShowsByTerm(term);

  $episodesArea.hide();
  populateShows(shows);
}

$searchForm.on("submit", async function (evt) {
  evt.preventDefault();
  await searchForShowAndDisplay();
});


async function getEpisodesOfShow(id) {
  const response = await axios({
    baseURL: apiURL,
    url: `shows/${id}/episodes`,
    method: "GET",
  });

  return response.data.map(e => ({
    id: e.id,
    name: e.name,
    season: e.season,
    number: e.number,
  }));
}


/** Given list of episodes, create markup for each and to DOM */

function populateEpisodes(episodes) {
  $episodesList.empty();

  for (let episode of episodes) {
    const $item = $(
      `<li>
         ${episode.name}
         (season ${episode.season}, episode ${episode.number})
       </li>
      `);

    $episodesList.append($item);
  }

  $episodesArea.show();
}


/** Handle click on episodes button: get episodes for show and display */

async function getEpisodesAndDisplay(evt) {

  const showId = $(evt.target).closest(".Show").data("show-id");

  const episodes = await getEpisodesOfShow(showId);
  populateEpisodes(episodes);
}

$showsList.on("click", ".Show-getEpisodes", getEpisodesAndDisplay);