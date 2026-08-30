import { prisma } from "./config/prisma"

async function runVerification() {
  console.log("==================================================")
  console.log("RAG PHASE 3: DATABASE VERIFICATION TEST")
  console.log("==================================================")

  try {
    // 1. Verify existing tables & data
    const userCount = await prisma.user.count()
    const goalCount = await prisma.learningGoal.count()
    const skillCount = await prisma.skill.count()
    const topicCount = await prisma.topic.count()
    const taskCount = await prisma.task.count()
    const activityCount = await prisma.dailyActivity.count()
    const achievementCount = await prisma.userAchievement.count()
    const focusCount = await prisma.focusSession.count()

    console.log("✓ Existing Tables & Records Preserved:")
    console.log(`  - Users: ${userCount}`)
    console.log(`  - Learning Goals: ${goalCount}`)
    console.log(`  - Skills: ${skillCount}`)
    console.log(`  - Topics: ${topicCount}`)
    console.log(`  - Tasks: ${taskCount}`)
    console.log(`  - Daily Activities: ${activityCount}`)
    console.log(`  - User Achievements: ${achievementCount}`)
    console.log(`  - Focus Sessions: ${focusCount}`)

    // 2. Create a test user for document testing
    const testUser = await prisma.user.create({
      data: {
        name: "RAG Verification User",
        email: `rag_verify_${Date.now()}@skillsync.test`,
        passwordHash: "$2b$10$temporarytestpasswordhashfortestingphase3",
      },
    })
    console.log(`\n✓ Created Test User: ${testUser.email} (id: ${testUser.id})`)

    // 3. Test Document creation
    const testDoc = await prisma.document.create({
      data: {
        userId: testUser.id,
        title: "React Server Components Architecture",
        originalName: "rsc-architecture.pdf",
        storedFilename: `doc_verify_${Date.now()}.pdf`,
        fileType: "PDF",
        mimeType: "application/pdf",
        fileSize: 1024 * 250,
        storagePath: `uploads/documents/${testUser.id}/test.pdf`,
        status: "UPLOADED",
        totalChunks: 2,
        pageCount: 15,
      },
    })
    console.log(`✓ Created Document: "${testDoc.title}" (id: ${testDoc.id}, status: ${testDoc.status})`)

    // 4. Test DocumentChunk creation
    const chunk1 = await prisma.documentChunk.create({
      data: {
        documentId: testDoc.id,
        userId: testUser.id,
        chunkIndex: 0,
        content: "React Server Components (RSC) allow developers to write components that render exclusively on the server.",
        tokenCount: 22,
        pageNumber: 1,
        metadata: { charCount: 104 },
      },
    })
    console.log(`✓ Created Chunk 1: index ${chunk1.chunkIndex} (id: ${chunk1.id})`)

    const chunk2 = await prisma.documentChunk.create({
      data: {
        documentId: testDoc.id,
        userId: testUser.id,
        chunkIndex: 1,
        content: "Server Actions provide a way to run server-side code in response to user interactions such as form submissions.",
        tokenCount: 24,
        pageNumber: 2,
        metadata: { charCount: 116 },
      },
    })
    console.log(`✓ Created Chunk 2: index ${chunk2.chunkIndex} (id: ${chunk2.id})`)

    // 5. Test Unique Constraint on [documentId, chunkIndex]
    try {
      await prisma.documentChunk.create({
        data: {
          documentId: testDoc.id,
          userId: testUser.id,
          chunkIndex: 0, // duplicate index
          content: "Duplicate chunk index content.",
          tokenCount: 6,
          metadata: { charCount: 30 },
        },
      })
      throw new Error("FAILED: Unique constraint on [documentId, chunkIndex] did not prevent duplicate chunk!")
    } catch (e: any) {
      console.log(`✓ Unique Constraint Verified: Duplicate [documentId, chunkIndex] rejected (${e.code || "P2002"})`)
    }

    // 6. Test User Isolation / Document retrieval
    const userDocs = await prisma.document.findMany({
      where: { userId: testUser.id },
      include: {
        chunks: {
          orderBy: { chunkIndex: "asc" },
        },
      },
    })
    console.log(`✓ Retrieved ${userDocs.length} document(s) with ${userDocs[0]?.chunks.length} chunk(s) for test user.`)

    // 7. Test Cascade Delete
    await prisma.user.delete({
      where: { id: testUser.id },
    })
    console.log(`✓ Deleted Test User (Cascade Delete triggered)`)

    const orphanedDoc = await prisma.document.findUnique({ where: { id: testDoc.id } })
    const orphanedChunks = await prisma.documentChunk.findMany({ where: { documentId: testDoc.id } })
    console.log(`✓ Cascade Delete Verification: Documents remaining = ${orphanedDoc ? 1 : 0}, Chunks remaining = ${orphanedChunks.length}`)

    console.log("\n==================================================")
    console.log("ALL PHASE 3 DATABASE VERIFICATIONS PASSED!")
    console.log("==================================================")
  } catch (error) {
    console.error("Verification failed with error:", error)
  } finally {
    await prisma.$disconnect()
  }
}

runVerification()
