# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/).

## [Unreleased]

## [0.1.0] - 2026-11-12

### Added
- First version. On youtube.com the play and pause keys act on the main player, so a queued video or a hover preview cannot take them.
- The playing or paused state that the browser reports to the system follows the main player.
- Pages with no main player, such as Shorts, keep using the handlers YouTube registers.
