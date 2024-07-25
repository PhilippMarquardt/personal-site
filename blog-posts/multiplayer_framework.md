# Multiplayer Framework

This project was aiming to provide a low-level multiplayer API that can be used in Unity. It was developed in a small group of me and 3 others while being in University. Since the original repository is a privat one which I can't change the linked github repo is a mirror. The difference from common multiplayer frameworks is that it supports (and was designed) to allow multiplayer for AR/VR applications. This was a major learning step for me since this multiplayer framework allows sending packets using UDP or TCP. It also allows for file sending and message sending over the network. A lobby can be created in which people can join.

One of the core components are network shared variables defined as:
```c#
using NetLib.Serialization;

namespace NetLib.NetworkVar
{
    /// <summary>
    /// Generic container for networked variables inside of a NetworkBehaviour.
    /// </summary>
    /// <typeparam name="T">A serializable type for the internal value</typeparam>
    public class NetworkVar<T> : INetworkVar
    {
        private T internalValue;

        /// <summary>
        /// Used to get and set the value of this <see cref="NetworkVar{T}"/>.
        /// Use this instead of reassigning the NetworkVar object.
        /// </summary>
        public T Value
        {
            get => internalValue;
            set
            {
                internalValue = value;
                IsDirty = true;
            }
        }

        /// <inheritdoc/>
        public bool IsDirty { get; private set; }

        /// <summary>
        /// Initializes the internal value to its type's default value.
        /// </summary>
        public NetworkVar()
        {
            internalValue = default;
        }

        /// <summary>
        /// Initializes the internal value to the given value.
        /// </summary>
        /// <param name="value">the initial value</param>
        public NetworkVar(T value)
        {
            internalValue = value;
        }

        public static implicit operator T(NetworkVar<T> networkVar) => networkVar.internalValue;
        public static explicit operator NetworkVar<T>(T t) => new NetworkVar<T>(t);

        /// <inheritdoc/>
        public void ResetDirty()
        {
            IsDirty = false;
        }

        /// <inheritdoc/>
        public void WriteValue(byte[] data)
        {
            Serializer.Deserialize(ref internalValue, data);
        }

        /// <inheritdoc/>
        public void ReadValue(out byte[] data)
        {
            data = Serializer.Serialize(internalValue);
        }
    }
}
```

The Client is defined as an Interface that also has to implement the Transport Interface.
```c#
﻿namespace NetLib.Transport
{
    /// <summary>
    /// Represents a transport layer client.
    /// </summary>
    /// <remarks>
    /// For more information see <see cref="ITransport"/>.
    /// </remarks>
    public interface IClient : ITransport
    {
        /// <summary>
        /// Connects this client to a server.
        /// </summary>
        /// <param name="ip">The ip address of the server to which to connect.</param>
        /// <param name="port">The network port of the server on which to connect to.</param>
        /// <exception cref="FailedToStartClientException">The client could not be initialized.</exception>
        void Connect(string ip, ushort port);

        /// <summary>
        /// Disconnects this client from the connected server.
        /// </summary>
        void Disconnect();
    }
}
```

```c#
﻿namespace NetLib.Transport
{
    /// <summary>
    /// Delegate for handling connect messages.
    /// </summary>
    /// <remarks>
    /// For a server receiving this message the <c>id</c> will be a new connection id for the client which just
    /// connected. For a client receiving this message the <c>id</c> will be 0, denoting the connection id of the
    /// server.
    /// </remarks>
    /// <param name="id">Connection ID of the participant which just connected.</param>
    public delegate void OnConnect(ulong id);

    /// <summary>
    /// Delegate for handling disconnect messages.
    /// </summary>
    /// <remarks>
    /// For a server receiving this message the <c>id</c> will be a new connection id for the client which just
    /// disconnected. For a client receiving this message the <c>id</c> will be 0, denoting the connection id of the
    /// server.
    /// </remarks>
    /// <param name="id">Connection ID of the client which just disconnected.</param>
    public delegate void OnDisconnect(ulong id);

    /// <summary>
    /// Delegate for handling data messages.
    /// </summary>
    /// <param name="id">Connection ID of the participant who sent the message.</param>
    /// <param name="data">The data sent by the participant.</param>
    public delegate void OnData(ulong id, byte[] data);

    /// <summary>
    /// Represents a transport layer peer for sending and receiving messages across the network.
    /// </summary>
    /// <remarks>
    /// The transport layer peer is a participant in a client/server architecture. There can be many clients but only
    /// one server in a given connection. A connection is bound to a network port. Therefore multiple client/server
    /// connections can be run in parallel on separate ports.
    /// <para>
    /// Each participant gets assigned a connection id, which is used to identify the receiver when sending messages.
    /// The server will always have the ID 0.
    /// </para>
    /// <para>
    /// The transport object can be either a client or a server. A server can send and receive messages to and from
    /// all connected clients. A client can only send and receive messages to and from the server it is connected to.
    /// </para>
    /// <para>
    /// In order to react to received messages the <see cref="OnConnect"/>, <see cref="OnData"/> and
    /// <see cref="OnDisconnect"/> delegate members can be subscribed to. Incoming messages are internally queued and
    /// the delegates are only invoked when <see cref="Poll"/> is called.
    /// </para>
    /// Base interface for <see cref="IServer"/> and <see cref="IClient"/>.
    /// </remarks>
    public interface ITransport
	{
        /// <summary>
        /// Contains functions called if a connection is established.
        /// <remarks>
        /// See OnConnect delegate type for more information. 
        /// </remarks>
        /// </summary>
        OnConnect OnConnect { get; set; }

        /// <summary>
        /// Contains functions called if data is received.
        /// <remarks>
        /// See OnData delegate type for more information.
        /// </remarks>
        /// </summary>
        OnData OnData { get; set; }

        /// <summary>
        /// Contains functions called if peer disconnects.
        /// <remarks>
        /// See OnDisconnect delegate type for more information.
        /// </remarks>
        /// </summary>
        OnDisconnect OnDisconnect { get; set; }

        /// <summary>
        /// Whether this transport is connected and running.
        /// </summary>
        bool IsActive { get; }

        /// <summary>
        /// Polls all received messages since the last call to <see cref="Poll"/> and invokes the corresponding
        /// delegates.
        /// </summary>
        void Poll();

        /// <summary>
        /// Sends a data message to a connected peer.
        /// </summary>
        /// <param name="message">The data to be sent.</param>
        /// <param name="id">The connection id of the peer to send the data to.</param>
        /// <exception cref="System.ArgumentNullException">The <c>message</c> is null.</exception>
        /// <exception cref="InvalidConnectionIdException">The <c>id</c> is not a valid connected peer.</exception>
        /// <exception cref="MessageNotSentException">The message could not be sent.</exception>
        void Send(byte[] message, ulong id = 0);
    }
}
```

The actual implementation of for example the UDP client can be seen here:
```c#
using NetLib.Serialization;

namespace NetLib.NetworkVar
{
    /// <summary>
    /// Generic container for networked variables inside of a NetworkBehaviour.
    /// </summary>
    /// <typeparam name="T">A serializable type for the internal value</typeparam>
    public class NetworkVar<T> : INetworkVar
    {
        private T internalValue;

        /// <summary>
        /// Used to get and set the value of this <see cref="NetworkVar{T}"/>.
        /// Use this instead of reassigning the NetworkVar object.
        /// </summary>
        public T Value
        {
            get => internalValue;
            set
            {
                internalValue = value;
                IsDirty = true;
            }
        }

        /// <inheritdoc/>
        public bool IsDirty { get; private set; }

        /// <summary>
        /// Initializes the internal value to its type's default value.
        /// </summary>
        public NetworkVar()
        {
            internalValue = default;
        }

        /// <summary>
        /// Initializes the internal value to the given value.
        /// </summary>
        /// <param name="value">the initial value</param>
        public NetworkVar(T value)
        {
            internalValue = value;
        }

        public static implicit operator T(NetworkVar<T> networkVar) => networkVar.internalValue;
        public static explicit operator NetworkVar<T>(T t) => new NetworkVar<T>(t);

        /// <inheritdoc/>
        public void ResetDirty()
        {
            IsDirty = false;
        }

        /// <inheritdoc/>
        public void WriteValue(byte[] data)
        {
            Serializer.Deserialize(ref internalValue, data);
        }

        /// <inheritdoc/>
        public void ReadValue(out byte[] data)
        {
            data = Serializer.Serialize(internalValue);
        }
    }
}
```


## More functionality
Even file sending is all implemented by scratch without any high level functionality:
```c#
using System.Collections.Generic;
using NetLib.Serialization;

namespace NetLib.Utils
{
    /// <summary>
    /// Responsible for reconstructing file messages that are split into multiple parts.
    /// </summary>
    public class FileHandler
    {
        // Caches the parts of the messages for later reconstruction
        private readonly Dictionary<string, List<byte>> fileArrays = new Dictionary<string, List<byte>>();

        /// <summary>
        /// Adds a message part to the message cache and writes the files, if all parts of the message are received.
        /// </summary>
        /// <param name="totalMessageParts">Total number of parts the message is split into.</param>
        /// <param name="currentMessagePart">The current message part which will get added.</param>
        /// <param name="fileHash">The hash value by which to identify the file to which the message belongs to.</param>
        /// <param name="fileBytes">The file bytes of the current message part will will get added.</param>
        /// <param name="destinationPath">Path to where to save the completed file on the target system.</param>
        public void AddMessage(int totalMessageParts, int currentMessagePart, string fileHash, byte[] fileBytes, string destinationPath)
        {
            // add new part
            if (currentMessagePart < totalMessageParts)
            {
                if (!fileArrays.ContainsKey(fileHash))
                    fileArrays.Add(fileHash, new List<byte>(fileBytes));
                else
                    fileArrays[fileHash].AddRange(fileBytes);
            }

            // save file if parts are complete
            if (currentMessagePart == totalMessageParts - 1)
            {
                ReconstructFullMessage(fileArrays[fileHash], destinationPath);
                fileArrays.Remove(fileHash);
            }
        }

        private void ReconstructFullMessage(List<byte> msg, string path)
        {
            FileSerializer.Deserialize(msg.ToArray(), path);
        }
    }
}
```