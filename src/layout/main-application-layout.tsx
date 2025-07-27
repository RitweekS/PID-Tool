'use client';
import { Box } from '@mui/material'
import React from 'react'
import LeftDrawer from './leftdrawer'
import RightToolbarDrawer from '../components/RightToolbarDrawer'
import Appbar from './appbar'
import Footer from './footer'
import { NodeProvider } from '../components/NodeContext'
import { LineProvider } from '../components/LineContext'
import { LayerProvider } from '../components/LayerContext'
import { useAuthContext } from '../components/AuthProvider'
import { usePathname } from 'next/navigation'

const MainApplicationLayout = ({ children }: { children: React.ReactNode }) => {
  const { isAuthenticated } = useAuthContext()
  const pathname = usePathname()
  const isLoginPage = pathname.startsWith('/auth/login')

  return (
    <NodeProvider>
      <LineProvider>
        <LayerProvider>
          {!isAuthenticated || isLoginPage ? (
            <>{children}</>
          ) : (
            <Box sx={{
                display: 'flex',
                flexDirection: 'column',
                width: '100vw',
                height: '100vh',
                overflow: 'hidden',
            }}>
                <Appbar />
                <Box sx={{
                    display: 'flex',
                    flexDirection: 'row',
                    flex: 1,
                    overflow: 'hidden',
                }}>
                    <LeftDrawer />
                    <Box sx={{
                        flex: 1,
                        height: '100%',
                    }}>
                        {children}
                    </Box>
                    <RightToolbarDrawer selectedNode={null} />
                </Box>
                <Footer />
            </Box>
          )}
        </LayerProvider>
      </LineProvider>
    </NodeProvider>
  )
}

export default MainApplicationLayout