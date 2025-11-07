#!/usr/bin/env python3
"""
Gemini File Search Store Management Utility

Usage:
    python3 manage-store.py list                              # List all stores
    python3 manage-store.py list <store-name>                 # List documents in a store
    python3 manage-store.py delete <store-name>               # Delete entire store
    python3 manage-store.py remove <doc-id>                   # Remove a document
    python3 manage-store.py query <store-name> "question"     # Query a store
"""

import os
import sys
from dotenv import load_dotenv
from google import genai
from google.genai import types

load_dotenv()

# Initialize the client
client = genai.Client(api_key=os.getenv("GEMINI_API_KEY"))

def list_stores():
    """List all File Search Stores"""
    print("📚 Your File Search Stores:\n")
    stores = list(client.file_search_stores.list())
    
    if not stores:
        print("   No stores found.")
        print("   Create one by running: python3 gemini-rag-zero.py")
        print("   (Make sure to comment out the deletion line to keep it persistent)")
        return []
    
    for i, store in enumerate(stores, 1):
        print(f"{i}. {store.display_name}")
        print(f"   Name: {store.name}")
        print(f"   Created: {store.create_time}")
        
        # Show document count
        try:
            docs = list(client.file_search_stores.list_documents(file_search_store_name=store.name))
            print(f"   Documents: {len(docs)}")
        except:
            pass
        print()
    
    return stores

def list_documents(store_name):
    """List all documents in a specific File Search Store"""
    print(f"\n📄 Documents in store:\n")
    
    try:
        documents = list(client.file_search_stores.list_documents(file_search_store_name=store_name))
        
        if not documents:
            print("   No documents found in this store.")
            return []
        
        total_size = 0
        for i, doc in enumerate(documents, 1):
            size_mb = getattr(doc, 'size_bytes', 0) / (1024 * 1024) if hasattr(doc, 'size_bytes') else 0
            total_size += size_mb
            
            print(f"{i}. {doc.display_name}")
            print(f"   ID: {doc.name}")
            if size_mb > 0:
                print(f"   Size: {size_mb:.2f} MB")
            if hasattr(doc, 'create_time'):
                print(f"   Created: {doc.create_time}")
            if hasattr(doc, 'metadata') and doc.metadata:
                print(f"   Metadata: {doc.metadata}")
            print()
        
        print(f"Total: {len(documents)} document(s), ~{total_size:.2f} MB")
        return documents
        
    except Exception as e:
        print(f"   ❌ Error: {e}")
        return []

def delete_store(store_name):
    """Delete an entire File Search Store"""
    try:
        print(f"⚠️  Deleting store: {store_name}")
        print("   This will remove the store and all its documents.")
        confirm = input("   Type 'yes' to confirm: ")
        
        if confirm.lower() == 'yes':
            client.file_search_stores.delete(name=store_name, config={'force': True})
            print("   ✅ Store deleted successfully!")
        else:
            print("   ❌ Deletion cancelled.")
    except Exception as e:
        print(f"   ❌ Error deleting store: {e}")

def remove_document(doc_id):
    """Remove a specific document from a store"""
    try:
        print(f"⚠️  Removing document: {doc_id}")
        confirm = input("   Type 'yes' to confirm: ")
        
        if confirm.lower() == 'yes':
            client.file_search_stores.delete_document(name=doc_id)
            print("   ✅ Document removed successfully!")
        else:
            print("   ❌ Removal cancelled.")
    except Exception as e:
        print(f"   ❌ Error removing document: {e}")

def query_store(store_name, question, model="gemini-2.5-flash"):
    """Query a File Search Store with a question"""
    print(f"🔍 Querying store: {store_name}\n")
    print(f"Q: {question}\n")
    
    try:
        response = client.models.generate_content(
            model=model,
            contents=question,
            config=types.GenerateContentConfig(
                tools=[
                    types.Tool(
                        file_search=types.FileSearch(
                            file_search_store_names=[store_name]
                        )
                    )
                ]
            )
        )
        
        print(f"A: {response.text}\n")
        
        # Show citations if available
        if response.candidates[0].grounding_metadata:
            print("📌 Sources:")
            for chunk in response.candidates[0].grounding_metadata.grounding_chunks:
                if hasattr(chunk, 'file_search'):
                    doc = chunk.file_search.document
                    print(f"   • {doc.display_name}")
                    if hasattr(chunk.file_search, 'page_range'):
                        pages = chunk.file_search.page_range
                        print(f"     Pages: {pages.start_page_index}-{pages.end_page_index}")
        else:
            print("(No sources cited)")
            
    except Exception as e:
        print(f"❌ Error querying store: {e}")

def interactive_query(store_name):
    """Interactive query mode - ask multiple questions"""
    print(f"\n✅ Querying store: {store_name}\n")
    print("Enter questions (or 'quit' to exit)\n")
    
    while True:
        print("Question: ", end='')
        question = input().strip()
        
        if question.lower() in ['quit', 'exit', 'q']:
            break
        
        if question:
            print()
            query_store(store_name, question)
            print()

def show_usage():
    """Show usage information"""
    print("""
🔧 Gemini File Search Store Manager

Usage:
    python3 manage-store.py list                            # List all stores
    python3 manage-store.py list <store-name>               # List documents in a store
    python3 manage-store.py delete <store-name>             # Delete entire store
    python3 manage-store.py remove <doc-id>                 # Remove a document
    python3 manage-store.py query <store-name> "question"   # Query a store

Examples:
    # List all stores
    python3 manage-store.py list
    
    # View documents in a store
    python3 manage-store.py list fileSearchStores/abc123
    
    # Query a store
    python3 manage-store.py query fileSearchStores/abc123 "What are the key findings?"
    
    # Delete a store
    python3 manage-store.py delete fileSearchStores/abc123
    
    # Remove a specific document
    python3 manage-store.py remove fileSearchStores/abc123/documents/xyz789

Interactive Mode:
    python3 manage-store.py                                 # Browse stores
    
Note: Store IDs are shown when you run 'list' command.
""")

def main():
    if len(sys.argv) < 2:
        # Interactive mode - list all and let user select
        print("🚀 Gemini File Search Store Manager\n")
        stores = list_stores()
        
        if stores:
            print("\nEnter store number to view documents (or 'q' to quit): ", end='')
            choice = input().strip()
            
            if choice.isdigit():
                idx = int(choice) - 1
                if 0 <= idx < len(stores):
                    list_documents(stores[idx].name)
        return
    
    command = sys.argv[1].lower()
    
    if command == 'list':
        if len(sys.argv) == 2:
            # List all stores
            list_stores()
        elif len(sys.argv) == 3:
            # List documents in specific store
            store_name = sys.argv[2]
            list_documents(store_name)
        else:
            show_usage()
    
    elif command == 'delete':
        if len(sys.argv) == 3:
            store_name = sys.argv[2]
            delete_store(store_name)
        else:
            print("❌ Error: Missing store name")
            print("Usage: python3 manage-store.py delete <store-name>")
    
    elif command == 'remove':
        if len(sys.argv) == 3:
            doc_id = sys.argv[2]
            remove_document(doc_id)
        else:
            print("❌ Error: Missing document ID")
            print("Usage: python3 manage-store.py remove <document-id>")
    
    elif command == 'query':
        if len(sys.argv) == 3:
            # Interactive query mode
            store_name = sys.argv[2]
            interactive_query(store_name)
        elif len(sys.argv) == 4:
            # Single question mode
            store_name = sys.argv[2]
            question = sys.argv[3]
            query_store(store_name, question)
        else:
            print("❌ Error: Missing arguments")
            print("Usage: python3 manage-store.py query <store-name> [\"question\"]")
    
    elif command in ['help', '-h', '--help']:
        show_usage()
    
    else:
        print(f"❌ Unknown command: {command}")
        show_usage()

if __name__ == "__main__":
    main()
