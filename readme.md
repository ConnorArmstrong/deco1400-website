# MyMedia 📚

> A simple website for browsing, managing, reviewing and journalling your book and movie collection.


## Table of Contents

- [Overview](#overview)  
- [Features](#features)  
- [Running Locally](#running-locally)  
- [HTML Pages](#html-pages)  
  - [index.html](#indexhtml)  
  - [library.html](#libraryhtml)  
  - [content.html](#contenthtml)  
  - [json-testing.html](#json-testinghtml)  
  - [login.html](#loginhtml)  
- [Project Structure](#project-structure)  
  - [components/](#components)  
  - [css/](#css)  
  - [design-images/](#design-images)  
  - [js/](#js)  
  - [json-schemas/](#json-schemas)  
  - [media/](#media)  
- [Data Files](#data-files)  
- [How It Works](#how-it-works)  

---


## Overview

MyMedia allows you to add and review books and movies. This is functional and is driven by a `data.json` file and `localStorage`.


## Features
- See recent content on the **Home Page** carousels
- Browse all titles on a central **Library** page with Client-side filtering, sorting and tag search
- View details (cover, summary, rating, tags) on a **Content** page  
- Simple login check with `localStorage`


## Running Locally
Note that is was run through python's simple http called by:

```bash
python -m http.server [port]
```

in the projects root.

This was implemented and tested in *Firefox*. It all should work with other methods. Fingers crossed.


## HTML Pages

### **index.html**  
- Landing page  
- Redirects to `login.html` if not authenticated  
- Links to **Library** and specific **Content** pages

### **library.html**  
- Displays a grid of cards populated from saved items
- Searching Functionality
- Sorting functionality (title, rating, date) with ascending/descending
- Filter panel (tags, status, type)  

### **content.html**  
- Detail view for a single item 
- Title, cover, metadata, summary, tags, series
- Free form user text input and directed question and answers
- Fully functioning `localStorage` saving for user input and user answers
- Content without answers saved loads random questions from `/media/questions.txt` which are then saved, loaded and displayed

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

All stylesheets are here, one for each page, each html component and a global `styles.css`

### design-images/

High Fidelity Prototype designs from A1. Used as a rough guide for implementation. Most pages stayed true to these designs.

### js/

#### **carousel.js**

**index.html** javascript file. Loads and handles the carousels, and displaying information regarding the selected content.

#### **content.js**

**content.html** javascript file. Loads and Populates the page, including adding questions and saving text.

#### **library.js**

**library.html** javascript file. Loads and Populates the saved content and handles the page state (searching, sorting, filtering).

#### **login.js**

**login.html** javascript file. Handles loading the image thumbnails and using them for the background animation. Also handles login form validation and functionality. .

#### **modal-loader.js**

**modal.html** javascript file. Handles Modal opening/closing, form validation and injecting it onto each page. Also unfortunately handles two global events - switching between light and dark theme, and a `Ctrl + Alt + R` keybind to reset the `localStorage` to the `data.json` file default.

This runs on pages **index.html**, **library.html** and **content.html**.

#### **nav-loader.js**

**navbar.html** javascript file. Handles Navigation Bar loading and injection. This runs on pages **index.html**, **library.html** and **content.html**.

#### **utils.js**

This javascript file handles the `localStorage` interaction. It provides functions relating to loading, saving, caching, reading and updating data stored in the `data.json` file. It also provides functions relating to logging in and managing a username, as well as storing and toggling the light/dark theme.


### json-schemas/

This is mostly unnecessary and was a relative waste of time. These are not referred to in other files, but do provide a general idea of how the data for each content is stored in the `data.json` file

- **content-schema.json** - The outline of each specific piece of content with comments and explanations
- **data-schema.json** - Wrapper for **content-schema**, handling a list of content

### media/

#### books/

Contains thumbnails/covers for the books. Note that here there are some unused covers, contained here but not in `data.json`.

#### movies/

Contains thumbnails/covers for the movies. Note that here there are some unused covers, contained here but not in `data.json`.

#### data.json/

The main data for MyMedia. This is loaded and stored in `localStorage` to allow for user content to be saved for future use. This data is loaded at startup and read by all major pages. The **Content** page (content.html) can update this information when the user inputs text in either the user text section or the Q and A section. If a piece of content has no listed questions, 3 random questions from **questions.txt** are loaded into the `localStorage` for the given data.

**IMPORTANT:** pressing `Ctrl + Alt + R` **reloads** the data from `data.json` into `localStorage` resetting updated text. This also resets/refreshes questions loaded in from **content.js** for content that has no hard-coded questions (eg The King in Yellow).

Note that currently adding new content to the `data.json` file is not handled by the webpage at this time. Only user driven content.


#### questions.txt/

A list of questions that are randomly selected for content without hard coded questions in `data.json`. Originally it was planned to have different questions for different content status (completed/in progress/planned) but this functionality is not added. Also, currently all questions are text-based open ended questions for journaling. In the future, more categorical or non-text based questions could be added.


## Data Files:

- **/media/data.json**:

```json
{
    "$schema": "http://json-schema.org/draft-07/schema#",
    "title": "mediaItem",
    "type": "object",
    "required": ["title", "date", "contentType"],
    "properties": {
        "title": {
            "type": "string",
            "description": "User given title. For now will match with saved image"
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