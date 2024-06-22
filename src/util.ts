import { JomoNavigation, Page } from "./types";

/**
 * 
 * @param page - The next page data attributes
 * Hello
 * @param nav - Global app nav state
 * @param setNav - Set global nav state dispatch function
 * 
 * Creates a nextPage type for rendering the next page
 */
function nextPage(
    nav: JomoNavigation,
    setNav: React.Dispatch<React.SetStateAction<JomoNavigation>>,
    page?: Page,

  ) {
    // Create a new nav object
    let new_nav: JomoNavigation =  {
      next: null,
      previous: nav,
      data: page? page : nav.next? nav.next.data : null

    }

    // update the previous to hold this as its next
    let previous_nav: JomoNavigation = {...nav, next: new_nav};

    // update the new_nav to have the updated previous nav
    new_nav.previous = previous_nav;
  
    setNav(new_nav);
  }
  
  function previousPage(
    nav: JomoNavigation,
    setNav: React.Dispatch<React.SetStateAction<JomoNavigation>>
  ) {
    // set the current nav to previous
    let new_nav: JomoNavigation =  {
      data: nav.previous? nav.previous.data : nav.previous,
      next: nav,
      previous:  nav.previous? nav.previous.previous : nav.previous
    }
  
    setNav(new_nav);
  }

export {
    nextPage as default,
    previousPage
}