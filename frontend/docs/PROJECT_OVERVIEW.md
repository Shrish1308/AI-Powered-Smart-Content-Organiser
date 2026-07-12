# Smart Recall - Project Overview

## What is Smart Recall?
Smart Recall is an AI-powered note-taking and knowledge management application that enables users to dump information rapidly and recall it effortlessly through semantic search and AI assistance.

## Purpose
The primary purpose of Smart Recall is to reduce the cognitive load required to organize notes. Instead of manually categorizing information into complex folder structures, users save raw text or links. The application leverages AI (Google Gemini) to auto-categorize, generate summaries, and power semantic search.

## Target Users
- Students managing study materials and research.
- Professionals tracking tasks, references, and meeting notes.
- Anyone suffering from information overload who wants a "second brain" that organizes itself.

## Main Problem It Solves
Traditional note apps require rigid tagging and categorization. When users forget the exact keyword they used to save something, traditional search fails. Smart Recall solves this by using semantic embeddings—allowing users to search by meaning (e.g., searching for "python references" and finding a note about "learning pandas").

## High-Level Architecture
- **Frontend**: React Native (Expo) mobile application.
- **Backend**: FastAPI (Python) web service.
- **Database**: PostgreSQL (with pgvector for semantic search) and SQLAlchemy ORM.
- **AI Services**: Google Gemini for content processing, summarization, and RAG (Retrieval-Augmented Generation) chat.

## Technology Stack
- **Frontend**: React Native, Expo, React Navigation, Axios.
- **Backend**: Python 3, FastAPI, Uvicorn.
- **AI/ML**: google-generativeai, SentenceTransformers (HuggingFace).
- **Database**: PostgreSQL, pgvector.
