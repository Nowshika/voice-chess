# ♟️ Voice-Controlled Chess  
### Inclusive Gaming Through Speech-Driven Interaction

A fully hands-free, browser-based chess application designed to empower individuals with motor impairments. This project eliminates the need for traditional mouse-and-keyboard input by enabling players to control the entire game using natural voice commands.

This system leverages modern web technologies to deliver an accessible, zero-cost assistive gaming solution that works directly in the browser without additional hardware.

---

## 📌 Problem Statement

Most digital chess platforms rely on click-and-drag mechanics, creating significant barriers for users with motor disabilities such as:
- Quadriplegia  
- Muscular dystrophy  
- Advanced arthritis  

Existing voice-enabled solutions often fail due to **microphone timeout limitations**, forcing users to repeatedly restart voice input. This project addresses that limitation by implementing a **persistent speech-recognition loop**, ensuring uninterrupted gameplay.

---

## 🎯 Project Objectives

- Enable **100% hands-free chess gameplay**
- Design a **persistent voice-recognition engine**
- Translate natural language into **legal chess moves**
- Follow accessibility and inclusive design principles
- Provide a **browser-based solution** with no paid dependencies

---

## 🛠️ Technical Stack

| Layer | Technology |
|------|-----------|
| Frontend | HTML5, CSS3 |
| Logic | Vanilla JavaScript |
| Speech Input | Web Speech API |
| Architecture | Model–View–Controller (MVC) |

---

## ✨ Key Features

### 🎙️ Persistent Speech Recognition
- Continuous listening using a recursive `onend` trigger
- Automatically restarts microphone input after silence
- Prevents default browser timeout behavior

### 🗣️ Natural Language Command Parsing
- Supports commands such as:
  - `D 2 to D 4`
  - `Kingside castle`
- Regex-based coordinate extraction
- Phonetic correction for homophones:
  - `"for"` → `4`
  - `"to"` → `2`
- Macro commands for castling and special moves

### ♟️ Chess Rule Enforcement
- Legal move validation based on FIDE rules
- Supports:
  - Castling  
  - En passant  
  - Pawn promotion  

### 👁️ Accessibility-Focused UI
- High-contrast chessboard design
- Unicode chess pieces for clarity
- CSS drop-shadow enhancements
- Optimized for visually impaired users
- Adheres to Web Content Accessibility Guidelines (WCAG)

---

## 🧱 System Architecture

The application follows the **Model–View–Controller (MVC)** design pattern:

### Model
- 2D array representing the 8×8 chessboard
- Tracks:
  - Piece positions
  - Castling rights
  - En passant targets

### View
- Dynamically renders board state
- Highlights legal moves
- Displays promotion dialogs

### Controller
- Integrates speech recognition
- Parses voice input into valid moves
- Handles user interaction logic

---

## ⚙️ Challenges & Solutions

| Challenge | Solution |
|---------|----------|
| Microphone timeout | Recursive restart logic in `recognition.onend` |
| Ambiguous speech input | Dictionary mapping + regex normalization |
| Piece visibility | CSS shadows and contrast optimization |

---

## 🌍 Social Impact

This project supports **inclusive digital participation** and aligns with  
**UN Sustainable Development Goal 10 – Reduced Inequalities**.

By eliminating the need for expensive assistive hardware (eye trackers, puff switches), this system provides an accessible, free alternative for individuals with physical disabilities to engage in intellectual gaming and social interaction.

---

## 🚀 Future Enhancements

- 🔊 Text-to-Speech feedback for opponent moves
- ♞ Piece-name commands (e.g., “Knight to C3”)
- 🤖 AI opponent integration
- 🌐 Multiplayer voice-based matches

---

## 📄 Documentation

Detailed project documentation is available in:  
📘 **Chess-Voice.pdf**

---

## 🧠 Learning Outcomes

- Built a real-time voice-controlled system
- Designed with accessibility-first principles
- Implemented MVC architecture in a web application
- Strengthened understanding of speech APIs and regex parsing

---

## 🧡 Author

**Nowshika Mirza R**  
Project Domain: Assistive Technology & Inclusive Gaming

---

## 📜 License
This project is licensed under the MIT License.

