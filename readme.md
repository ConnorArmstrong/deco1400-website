# 📚 MyMedia 

> A simple website for browsing, managing, reviewing and journalling your book and movie collection.

![MyMedia Poster](poster.png)

## Table of Contents

- [Overview](#overview)  
- [Features](#features)  
- [Running Locally](#running-locally)  
- [HTML Pages](#html-pages)  
  - [index.html](#indexhtml)  
  - [library.html](#libraryhtml)  
  - [content.html](#contenthtml)  
  - [login.html](#loginhtml)  
- [Project Structure](#project-structure)  
  - [components/](#components)  
  - [css/](#css)  
  - [design-images/](#design-images)  
  - [js/](#js)  
  - [json-schemas/](#json-schemas)  
  - [media/](#media)
- [Issues](#issues)
- [References](#references)
  - [Cover Images](#cover-images)
- [Data Files](#data-files)  
---


## Overview

MyMedia allows you to add and review books and movies.

This is currently **functional** and is driven by a `data.json` file and `localStorage`.


## Features
- See recent content on the **Home Page** carousels
- Browse all titles on a central **Library** page with searching, sorting and filtering
- View details on a **Content** page with fully functional freeform journalling and directed reflective questions
- Simple **Log In** check with `localStorage`
- Persistant data storage and visual theme switching

## Running Locally
Note that was run through python's http server called by:

```bash
python -m http.server [port]
```

in the project's root.

**!! IMPORTANT !!**\
Please note that on first launch you will be redirected to the log in page. Please enter a username and password of your choosing. The username is stored, but the password is simply there to test form validation and show proof of functionality. Thank you.

This was implemented and tested in **Firefox**. It all should work with other methods. Fingers crossed.


## HTML Pages

### **index.html**  
- Landing page  
- Redirects to `login.html` if not authenticated  
- Links to **Library** and specific **Content** pages

### **library.html**  
- Displays a grid of cards populated from saved items
- Searching Functionality
- Sorting functionality (title, rating, date) with ascending/descending order
- Filter panel (series, status, type, minimum rating)
- Directs to **Content** page when clicking specific content card

### **content.html**  
- Detailed view for a single item 
- Title, cover, metadata, summary, tags (not implemented), series
- Free form user text input and directed question and answers
- Fully functioning `localStorage` saving for user input and user answers
- Content without hard coaded questions loads random questions from `/media/questions.txt` which are then saved, loaded and displayed

### **login.html**  
- Basic login form with floating content thumbnails in the background
- Stores a "logged in" flag in `localStorage`  
- Redirects to `index.html` on success
- Form validation and Error Displays
- Note that no password is needed/handled/checked, but must be input for form validation

## Project Structure

### components/

- **modal.html** - Site-wide Add Review Modal
- **navbar.html** - Site-wide Navigation Bar

### css/

- All stylesheets are here, one for each page, each html component and a global `style.css`

### design-images/

- High Fidelity Prototype designs from A1. Used as a rough guide for implementation. Most pages stayed true to these designs.

### js/

#### **carousel.js**

- **index.html** javascript file. Loads and handles the carousels, and displaying information regarding the selected content.

#### **content.js**

- **content.html** javascript file. Loads and Populates the page, including adding questions and saving text.

#### **library.js**

- **library.html** javascript file. Loads and Populates the saved content and handles the page state (searching, sorting, filtering).

#### **login.js**

- **login.html** javascript file. Handles loading the image thumbnails and using them for the background animation. Also handles login form validation and functionality. .

#### **modal-loader.js**

- **modal.html** javascript file. Handles Modal opening/closing, form validation and injecting it onto each page. Also unfortunately handles two global events - switching between light and dark theme, and a `Ctrl + Alt + R` keybind to reset the `localStorage` to the `data.json` file default.

- This runs on pages **index.html**, **library.html** and **content.html**.

#### **nav-loader.js**

- **navbar.html** javascript file. Handles Navigation Bar loading and injection. This runs on pages **index.html**, **library.html** and **content.html**.

#### **utils.js**

- This javascript file handles the `localStorage` interaction. It provides functions relating to loading, saving, caching, reading and updating data stored in the `data.json` file. It also provides functions relating to logging in and managing a username, as well as storing and toggling the light/dark theme.


### json-schemas/

- This is mostly unnecessary and was a relative waste of time. These are not referred to in other files, but do provide a general idea of how the data for each content is stored in the `data.json` file

- **content-schema.json** - The outline of each specific piece of content with comments and explanations. This is shown [here](#data-files)
- **data-schema.json** - Wrapper for **content-schema**, handling a list of content

### media/

#### books/

- Contains thumbnails/covers for the books. Note that here there are some unused covers, contained here but not in `data.json`.

#### movies/

- Contains thumbnails/covers for the movies. Note that here there are some unused covers, contained here but not in `data.json`.

#### data.json/

- The schema for this is shown [here](#data-files)

- The main data for MyMedia. This is loaded and stored in `localStorage` to allow for user content to be saved for future use. This data is loaded at startup and read by all major pages. The **Content** page (content.html) can update this information when the user inputs text in either the user text section or the Q and A section. If a piece of content has no listed questions, 3 random questions from **questions.txt** are loaded into the `localStorage` for the given data.

- **IMPORTANT:** pressing `Ctrl + Alt + R` **reloads** the data from `data.json` into `localStorage` resetting updated text. This also resets/refreshes questions loaded in from **content.js** for content that has no hard-coded questions (eg not The King in Yellow or Walden).

- Note that currently adding new content to the `data.json` file is not handled by the webpage but extending functionality seems simple enough.


#### questions.txt/

- A list of questions that are randomly selected for content without hard coded questions in `data.json`. Originally it was planned to have different questions for different content status (completed/in progress/planned) but this functionality is not added. Also, currently all questions are text-based open ended questions for journaling. In the future, more categorical or non-text based questions could be added.


## Issues
- Currently mobile responsiveness is properly implemented for **login.html** and **content.html**. **library.html** has functional mobile responsiveness, but with some elements cut off and an inefficient design.

- **index.html** *DOES NOT* have a mobile breakpoint, and shrinking the viewport breaks the page.


## References:


### Cover Images:

The following table is the list of book and movie covers in the public domain retrieved from [Wikimedia Commons](https://commons.wikimedia.org/wiki/Main_Page) for use as placeholder content:

| *File Name*                                                                 | *Content Title*                                                          | *Author/Director/Artist*                              |
|------------------------------------------------------------------------------|--------------------------------------------------------------------------|-------------------------------------------------------|
| 713px-And_the_Stars_Were_Shining_-_John_Ashbery.jpg                          | And the Stars Were Shining                                               | John Ashbery                                          |
| 723px-Jaws_(1974)_front_cover,_first_edition.jpg                             | Jaws                                                                     | Peter Benchly                                         |
| 743px-Rivers_and_Mountains_(1st_ed.)_-_Ashbery.jpg                            | Rivers and Mountains                                                     | John Ashbery                                          |
| 749px-'Salem's_Lot_(1975)_front_cover,_first_edition.jpg                     | Salem’s Lot                                                              | Stephen King                                          |
| 960px-100_Things_Successful_People_Do_Hardback_Cover_by_Nigel_Cumberland.jpg | 100 Things Successful People Do: Little Exercises for Successful Living | Nigel Cumberland                                      |
| 960px-All_in_a_Lifetime_(1941)_cover.jpg                                     | All in a Lifetime                                                        | Frank Buck, Ferrin Fraser                             |
| 960px-Cujo_(1981)_front_cover,_first_edition.jpg                             | Cujo                                                                     | Stephen King                                          |
| 960px-I_Know_Why_the_Caged_Bird_Sings_front_cover,_1969_first_edition.jpg     | I Know Why the Caged Bird Sings                                          | Maya Angelou                                          |
| 960px-Jungle_tales_of_tarzan.jpg                                             | Jungle Tales of Tarzan                                                   | Edgar Ruce Burroughs                                  |
| 960px-Of_Mice_and_Men_(1937_1st_ed_dust_jacket).jpg                           | Of Mice and Men                                                          | John Steinbeck                                        |
| 960px-Popular_Library_116_-_The_Red_House_(George_Agnew_Chamberlain).jpg     | The Red House                                                            | George Agnew Chamberlain                              |
| 960px-Popular_Library_16_-_The_Dead_Don't_Care_(Jonathan_Latimer).jpg         | The Dead Don’t Care                                                      | Jonathan Latimer                                      |
| 960px-Popular_Library_33_-_McKee_of_Centre_Street_(Helen_Reilly).jpg          | The McKee of Centre Street                                               | Helen Reilly                                          |
| 960px-Popular_Library_528_-_Hooked_(Will_Oursler).jpg                         | Hooked (Narcotics: America’s Peril)                                      | Will Oursler and Laurence Dwight Smith                |
| 960px-Popular_Library_551_-_I_Dive_for_Treasure_(Lt._Harry_E._Rieseberg).jpg  | I Dive for Treasure                                                      | Lt. Harry E. Rieseberg                                |
| 960px-Popular_Library_G572_-_Portrait_of_Jennie_(Robert_Nathan).jpg           | Portrait of Jennie                                                       | Robert Nathan                                         |
| 960px-Popular_Library_W1106_-_Father_and_Son_(James_T._Farrell).jpg           | Father and Son                                                           | James T. Farrell                                      |
| frankenstein-front-cover-4fb8df.jpg                                           | Frankenstein                                                             | Mary W Shelley                                        |
| King_in_yellow.jpg                                                            | The King in Yellow                                                       | Neely’s Prismatic Library, Robert W. Chambers         |
| 500px-Final_straw_food_earth_happiness_tour_poster.jpg                        | Final Straw: food, earth, happiness                                      | Partrick Lydon and Suhee Kang                         |
| 764px-Affiche_sweetcocoon.png                                                 | Sweet Cocoon                                                             | Matéo Bernard, Matthias Bruget, Jonathan Duret        |
| 960px-150dpiWalden_A1_Poster.jpg                                              | Walden                                                                   | Daniel Zimmerman                                      |
| 960px-DANIEL_'16_Poster_GR.jpg                                                | Daniel ‘16                                                               | Dimitris Koutsiabasakos                               |
| 960px-Driven_To_Help_(Film_Poster).png                                        | Driven to Help                                                           | Phil Gioja                                            |
| 960px-Encounter_in_the_Air.jpg                                                | Encounter in the Air                                                     | Ardit Sadiku                                          |
| 960px-Jellyfish_poster.jpg                                                    | Jellyfish                                                                | James Gardner                                         |
| Affiche_Catch_It.jpg                                                          | Catch It                                                                 | Paul Bar, Marion Demaret, Nadège Forner              |
| the-endless-summer-1966-limited-release-poster-1146dc.jpg                     | The Endless Summer                                                       | Bruce Brown                                           |


## Data Files:

- **/media/data.json** Schema:

```json
{
    "$schema": "http://json-schema.org/draft-07/schema#",
    "title": "mediaItem",
    "type": "object",
    "required": ["title", "date", "contentType"],
    "properties": {
        "title": {
            "type": "string",
            "description": "User given Title. Also used as the primary key/id"
        },
        "date": {
            "type":"string",
            "description": "Date of Last User Interaction"
        },
        "contentType": {
            "type": "string",
            "description": "[ENUM: Book | Movie] Whether content is book or movie"
        },

        "thumbnail": {
            "type": "string",
            "description": "Path to content from starting directory"
        },
        "rating": {
            "type": ["number", "null"],
            "minimum": 0,
            "maximum": 5,
            "description": "User rating, null or nonexistent for no rating"
        },
        "amount": {
            "type": "integer",
            "description": "How often user has interacted with content"
        },
        "status": {
            "type": "string",
            "description": "[ENUM: Planned | In Progress | Completed] Status of content"
        },
        "series": {
            "type": ["string", "null"],
            "description": "Series of Content if Relevant"
        },
        "tags": {
            "type": "array",
            "items": {
                "type": "string"
            },
            "minItems": 0,
            "uniqueItems": true,
            "description": "A list of tags for the content"
        },

        "summary": {
            "type": "object",
            "required": ["text"],
            "properties": {
                "source": {
                    "type": "string",
                    "description": "Source of Auto Summary"
                },
                "text": {
                    "type": "string",
                    "description": "The auto summary text"
                },
                "platformRating": {
                    "type": ["number", "null"],
                    "minimum": 0,
                    "maximum": 5,
                    "description": "Platform rating, null or nonexistent for no rating"
                },
                "ratingN": {
                    "type": "integer",
                    "description": "How many people rated the content"
                }
            }
        },

        "userText": {
            "type": "string",
            "description": "What the user has written for this content"
        },

        "questions": {
            "type": "array",
            "description": "A list of question/answer pairs",
            "items": {
                "type": "object",
                "required": ["question","answer"],
                "properties": {
                "question": {
                    "type": "string",
                    "description": "A given question"
                },
                "answer": {
                    "type": "string",
                    "description": "A given corresponding text answer"
                }
                }
            },
            "minItems": 0
         }
    }
}

```

---



> Thank you for your time ❤️