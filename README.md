# Article Query
## Data Pipeline
## Webscraping Application



## Table of Contnents
-[Description](#Description)  
-[Requirements](#Requirements)  
-[Installation](#Installation)  
-[Getting-Started](#Getting-Started)  
-[Main-Ports](#Main-Ports)  
-[Additional-Ports](#Additional-Ports)  
-[Credits](#credits)  


## Description
    The process of collecting data to put it in a format ready for analysis and algorithms is tedious. Information on the web is often in a non-structured format while being bundled with undesirable data. Researchers need a solution to gathering this data that doesn't include hours of copying and pasting. This is where webscraping comes in.  
    Article Query is a data pipeline designed specifically for a handful of popular news sites. After receiving a search term and date range it returns all relevant articles from each selected website in a table sorted by news organization and date. The table can be viewed directly or downloaded as a csv file if needed.  
    Axios is used to send a request directly to the search api of the website to retrieve relevant json data. For websites with no such api, it instead parses through the html content of the website search pages. The data is then organized and formatted using the pandas python package to be presented and downloaded.  

## Requirements
Node JS
Python and pip

## Installation
1. Clone the repository:
```bash
 git clone https://github.com/yourusername/yourproject.git
```

*All further instructions assume you are in the project's home directory/folder

2. Install dependencies:
```bash
 npm install
 pip install -r requirements.txt
```

## Getting-Started
The use on of the run commands to start the main NextJS server:
```bash
npm run dev
```
OR

```bash
npm run build
npm run start
```
The application can then be used through the browser by inputting the port used by the program into the url(e.g. localhost://3000).
The main port is listed below (top of the list) along with any additional ports the program uses. Ensure all of these ports are open so the application can work properly.


## Main-Port
http://localhost:3001


## Additional-Ports
localhost:3003

## Credits
Author: Sean Knowles

