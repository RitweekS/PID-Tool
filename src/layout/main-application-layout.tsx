import { Box } from '@mui/material'
import React from 'react'
import LeftDrawer from './leftdrawer'
import { NodeProvider } from '../components/NodeContext'
import { LineProvider } from '../components/LineContext'

const MainApplicationLayout = ({ children }: { children: React.ReactNode }) => {
  return (
    <NodeProvider>
      <LineProvider>
        <Box sx={{
            display: 'flex',
            flexDirection: 'row',
            width: '100vw',
            height: '100vh',
            overflow: 'hidden',
        }}>
            <LeftDrawer />
            <Box sx={{
                flex: 1,
                height: '100%',
            }}>
                {children}
            </Box>
        </Box>
      </LineProvider>
    </NodeProvider>
  )
}

export default MainApplicationLayout