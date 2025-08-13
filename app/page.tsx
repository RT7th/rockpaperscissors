'use client';

import { useEffect, useState } from 'react';
import { useMiniKit } from '@coinbase/onchainkit/minikit';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'

type Choice = 'rock' | 'paper' | 'scissors'
type GameResult = 'win' | 'lose' | 'tie'

interface GameStats {
  wins: number
  losses: number
  ties: number
  totalGames: number
  points: number
}

interface GameHistory {
  playerChoice: Choice
  botChoice: Choice
  result: GameResult
  timestamp: number
}

const CHOICE_EMOJIS: Record<Choice, string> = {
  rock: '🪨',
  paper: '📄',
  scissors: '✂️'
}

const CHOICE_NAMES: Record<Choice, string> = {
  rock: 'Rock',
  paper: 'Paper',
  scissors: 'Scissors'
}

const POINTS_SYSTEM = {
  win: 3,
  tie: 1,
  lose: 0
}




export default function RockPaperScissorsGame() {
  const { setFrameReady, isFrameReady } = useMiniKit();

  // The setFrameReady() function is called when your mini-app is ready to be shown
  useEffect(() => {
    if (!isFrameReady) {
      setFrameReady();
    }
  }, [setFrameReady, isFrameReady]);

    const [stats, setStats] = useState<GameStats>({
        wins: 0,
        losses: 0,
        ties: 0,
        totalGames: 0,
        points: 0
      })
      
      const [gameHistory, setGameHistory] = useState<GameHistory[]>([])
      const [lastGame, setLastGame] = useState<GameHistory | null>(null)
      const [isPlaying, setIsPlaying] = useState<boolean>(false)
      const [showResult, setShowResult] = useState<boolean>(false)
    
      // Load saved data on component mount
      useEffect(() => {
        const savedStats = localStorage.getItem('rps-stats')
        const savedHistory = localStorage.getItem('rps-history')
        
        if (savedStats) {
          setStats(JSON.parse(savedStats))
        }
        
        if (savedHistory) {
          setGameHistory(JSON.parse(savedHistory))
        }
      }, [])
    
      // Save data whenever stats or history change
      useEffect(() => {
        localStorage.setItem('rps-stats', JSON.stringify(stats))
      }, [stats])
    
      useEffect(() => {
        localStorage.setItem('rps-history', JSON.stringify(gameHistory))
      }, [gameHistory])
    
      const getBotChoice = (): Choice => {
        const choices: Choice[] = ['rock', 'paper', 'scissors']
        return choices[Math.floor(Math.random() * choices.length)]
      }
    
      const determineWinner = (playerChoice: Choice, botChoice: Choice): GameResult => {
        if (playerChoice === botChoice) return 'tie'
        
        const winConditions: Record<Choice, Choice> = {
          rock: 'scissors',
          paper: 'rock',
          scissors: 'paper'
        }
        
        return winConditions[playerChoice] === botChoice ? 'win' : 'lose'
      }
    
      const playGame = async (playerChoice: Choice): Promise<void> => {
        if (isPlaying) return
    
        setIsPlaying(true)
        setShowResult(false)
    
        // Add slight delay for better UX
        await new Promise(resolve => setTimeout(resolve, 500))
    
        const botChoice = getBotChoice()
        const result = determineWinner(playerChoice, botChoice)
        
        const game: GameHistory = {
          playerChoice,
          botChoice,
          result,
          timestamp: Date.now()
        }
    
        const pointsEarned = POINTS_SYSTEM[result]
        
        setStats(prevStats => ({
          ...prevStats,
          wins: result === 'win' ? prevStats.wins + 1 : prevStats.wins,
          losses: result === 'lose' ? prevStats.losses + 1 : prevStats.losses,
          ties: result === 'tie' ? prevStats.ties + 1 : prevStats.ties,
          totalGames: prevStats.totalGames + 1,
          points: prevStats.points + pointsEarned
        }))
    
        setGameHistory(prev => [game, ...prev.slice(0, 9)]) // Keep last 10 games
        setLastGame(game)
        setShowResult(true)
        setIsPlaying(false)
      }
    
      const resetStats = (): void => {
        setStats({
          wins: 0,
          losses: 0,
          ties: 0,
          totalGames: 0,
          points: 0
        })
        setGameHistory([])
        setLastGame(null)
        setShowResult(false)
      }
    
      const getResultMessage = (result: GameResult): string => {
        switch (result) {
          case 'win':
            return '🎉 You Win!'
          case 'lose':
            return '😅 Bot Wins!'
          case 'tie':
            return '🤝 It\'s a Tie!'
        }
      }
    
      const getResultColor = (result: GameResult): string => {
        switch (result) {
          case 'win':
            return 'bg-green-500'
          case 'lose':
            return 'bg-red-500'
          case 'tie':
            return 'bg-yellow-500'
        }
      }
    
      const winRate = stats.totalGames > 0 ? Math.round((stats.wins / stats.totalGames) * 100) : 0

  return <div>
        {/* Header */}
                <div className="text-center py-6">
                  <h1 className="text-4xl font-bold text-gray-800 mb-2">
                    🎮 Rock Paper Scissors
                  </h1>
                  <p className="text-gray-600">
                    Play against the bot and earn points!
                  </p>
                </div>
        
                {/* Stats Overview */}
                <Card>
                  <CardHeader>
                    <CardTitle className="text-center">📊 Your Stats</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-2 md:grid-cols-5 gap-4 text-center">
                      <div>
                        <div className="text-2xl font-bold text-green-600">{stats.points}</div>
                        <div className="text-sm text-gray-500">Points</div>
                      </div>
                      <div>
                        <div className="text-2xl font-bold text-blue-600">{stats.totalGames}</div>
                        <div className="text-sm text-gray-500">Games</div>
                      </div>
                      <div>
                        <div className="text-2xl font-bold text-green-500">{stats.wins}</div>
                        <div className="text-sm text-gray-500">Wins</div>
                      </div>
                      <div>
                        <div className="text-2xl font-bold text-red-500">{stats.losses}</div>
                        <div className="text-sm text-gray-500">Losses</div>
                      </div>
                      <div>
                        <div className="text-2xl font-bold text-yellow-500">{winRate}%</div>
                        <div className="text-sm text-gray-500">Win Rate</div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
        
                {/* Game Area */}
                <Card>
                  <CardHeader>
                    <CardTitle className="text-center">
                      {isPlaying ? '🤖 Bot is thinking...' : '🎯 Make Your Choice'}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    {/* Game Result Display */}
                    {showResult && lastGame && (
                      <div className="mb-6 p-4 rounded-lg bg-gray-50 border">
                        <div className="text-center space-y-3">
                          <div className="flex justify-center items-center space-x-8">
                            <div className="text-center">
                              <div className="text-4xl mb-2">{CHOICE_EMOJIS[lastGame.playerChoice]}</div>
                              <div className="font-medium">You</div>
                              <div className="text-sm text-gray-500">{CHOICE_NAMES[lastGame.playerChoice]}</div>
                            </div>
                            
                            <div className="text-2xl font-bold text-gray-400">VS</div>
                            
                            <div className="text-center">
                              <div className="text-4xl mb-2">{CHOICE_EMOJIS[lastGame.botChoice]}</div>
                              <div className="font-medium">Bot</div>
                              <div className="text-sm text-gray-500">{CHOICE_NAMES[lastGame.botChoice]}</div>
                            </div>
                          </div>
                          
                          <Badge className={`${getResultColor(lastGame.result)} text-white px-4 py-2 text-lg`}>
                            {getResultMessage(lastGame.result)}
                          </Badge>
                          
                          <div className="text-sm text-gray-600">
                            +{POINTS_SYSTEM[lastGame.result]} points earned
                          </div>
                        </div>
                      </div>
                    )}
        
                    {/* Choice Buttons */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      {(['rock', 'paper', 'scissors'] as Choice[]).map((choice) => (
                        <Button
                          key={choice}
                          onClick={() => playGame(choice)}
                          disabled={isPlaying}
                          className="h-24 text-xl font-semibold hover:scale-105 transition-transform"
                          variant="outline"
                        >
                          <div className="text-center">
                            <div className="text-3xl mb-1">{CHOICE_EMOJIS[choice]}</div>
                            <div>{CHOICE_NAMES[choice]}</div>
                          </div>
                        </Button>
                      ))}
                    </div>
                  </CardContent>
                </Card>
        
                {/* Game History */}
                {gameHistory.length > 0 && (
                  <Card>
                    <CardHeader>
                      <CardTitle>📝 Recent Games</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-2 max-h-64 overflow-y-auto">
                        {gameHistory.map((game, index) => (
                          <div key={index} className="flex items-center justify-between p-3 rounded-lg bg-gray-50">
                            <div className="flex items-center space-x-4">
                              <span className="text-lg">{CHOICE_EMOJIS[game.playerChoice]}</span>
                              <span className="text-gray-400">vs</span>
                              <span className="text-lg">{CHOICE_EMOJIS[game.botChoice]}</span>
                            </div>
                            <Badge 
                              className={`${getResultColor(game.result)} text-white`}
                              variant="outline"
                            >
                              {game.result === 'win' ? 'Won' : game.result === 'lose' ? 'Lost' : 'Tie'}
                            </Badge>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                )}
        
                {/* Reset Button */}
                {stats.totalGames > 0 && (
                  <div className="text-center">
                    <Button onClick={resetStats} variant="outline" className="text-red-600 hover:text-red-700">
                      🔄 Reset All Stats
                    </Button>
                  </div>
                )}
        
                {/* Rules */}
                <Card>
                  <CardHeader>
                    <CardTitle>📖 Game Rules & Scoring</CardTitle>
                  </CardHeader>
                  <CardContent className="text-sm text-gray-600 space-y-2">
                    <div>• <strong>Rock</strong> beats Scissors</div>
                    <div>• <strong>Paper</strong> beats Rock</div>
                    <div>• <strong>Scissors</strong> beats Paper</div>
                    <Separator className="my-4" />
                    <div><strong>Points:</strong> Win = 3 points, Tie = 1 point, Loss = 0 points</div>
                  </CardContent>
                </Card>
    
    
    </div>;
}